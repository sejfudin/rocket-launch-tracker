import { Controller, Get, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnIdentity, AuthnModule, IAuthnIdentity } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { HtmlEmailCompilerPlugin } from '~common/email/compilers/html.email-compiler';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { EmailServiceMock } from '~common/email/tests/email.mock';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { USER_AUTH_REST_PREFIX, UserAuthModule, UserRoleCheck } from '~modules/users/auth';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserAuthForgotPasswordModule } from '~modules/users/auth/providers/local/forgot-password';
import { UserAuthMagicLinkModule } from '~modules/users/auth/providers/local/magic-link';
import { UserAuthPasswordModule } from '~modules/users/auth/providers/local/password';
import { UserModule } from '~modules/users/user';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';
import { UserFixture } from '~modules/users/user/tests/user.fixture';
import { UserRole } from '~modules/users/user/user.constants';
import { UserService } from '~modules/users/user/user.service';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

@Controller('test')
export class UserAuthnLocalTestController {
  constructor(private readonly userService: UserService) {}

  @Get('resource')
  @UserRoleCheck(UserRole.client)
  async user(@AuthnIdentity() identity: IAuthnIdentity): Promise<void> {
    const user = await this.userService.find({ id: identity.userId });
    if (!user?.roles.includes(UserRole.client as any)) {
      throw new Error('Not user');
    }
  }
}

describe('User Auth Forgot Password', () => {
  let app: INestApplication;
  const emailService = EmailServiceMock.useValue;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forRoot([UserPrismaRepositoryPlugin]),

          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          AuthzModule.forRoot([]),

          EmailModule.forRoot([NoOpEmailProviderPlugin, HtmlEmailCompilerPlugin]),

          UserAuthModule,
          UserAuthJwtModule,
          UserAuthMagicLinkModule,
          UserAuthForgotPasswordModule,
          UserAuthPasswordModule,
          UserModule,
        ],
        controllers: [UserAuthnLocalTestController],
      },
      {
        overrideProviders: [EmailServiceMock],
      },
    );
    prismaService = app.get(PrismaService);
  });

  it('should register, forget password and reset password', async () => {
    const user = await UserFixture.fromPartial(prismaService.client);

    await request(app.getHttpServer())
      .get(`/test/resource`)
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.OK);

    let code: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/forgot-password`)
      .send({ email: user.email })
      .expect(HttpStatus.OK);

    const newPassword = 'kz83vn7lwu2ipqxa9mcdt4';

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/forgot-password/callback`)
      .send({ password: 'kz83vn7lwu2ipqxa9mcdt4', code: 'fj92xt6qmv7rleodbz51wa' })
      .expect(HttpStatus.BAD_REQUEST);

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/forgot-password/callback`)
      .send({ password: newPassword, code })
      .expect(HttpStatus.OK);

    const {
      body: { accessToken: newAccessToken },
    } = await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/login`)
      .send({ password: newPassword, email: user.email })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/test/resource`)
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(HttpStatus.OK);
  });

  it(`should return bad request if email doesn't exist on forgot password`, async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/forgot-password`)
      .send({ email: `test+${makeId()}@test.com` })
      .expect(HttpStatus.BAD_REQUEST);

    expect(body.code).toEqual('identity-not-found');
  });
});
