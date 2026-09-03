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

describe('User Auth Local Providers', () => {
  let app: INestApplication;
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

  it('should register refresh token and get data', async () => {
    const email = `test+${makeId()}@test.com`;
    const password = 'testpassword1234';

    const {
      body: { refreshToken },
    } = await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/register`)
      .send({
        name: 'my-user',
        email,
        password,
      })
      .expect(HttpStatus.CREATED);

    // same user again should fail
    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/register`)
      .send({ email, password })
      .expect(HttpStatus.CONFLICT);

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/refresh`)
      .send({ refreshToken })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/login`)
      .send({ password, email })
      .expect(HttpStatus.OK);
  });

  it('should change password', async () => {
    const user = await UserFixture.fromPartial(prismaService.client);

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/register`)
      .send({ email: user.email, password: user.password })
      .expect(HttpStatus.CONFLICT);

    const newPassword = 'newpassword1234';
    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/password`)
      .send({ password: newPassword })
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/login`)
      .send({ password: newPassword, email: user.email })
      .expect(HttpStatus.OK);
  });

  it('should not allow bad passwords', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/register`)
      .send({
        name: 'test',
        email: `test+${makeId()}@test.com`,
        password: 'testsdfg',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(body.code).toEqual('validation-exception');
    expect(body.errors).toEqual({
      password: [expect.objectContaining({ type: 'minLength' })],
    });
  });

  it('should reject login when user authn identity is disabled', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client, {
      disabledAt: new Date(),
    });

    const { body } = await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/login`)
      .send({ email: user.email, password: user.password })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBe('account-disabled');

    const { body: body2 } = await request(app.getHttpServer())
      .post(`/${USER_AUTH_REST_PREFIX}/login`)
      .send({ email: user.entity.email, password: 'wrongpassword' })
      .expect(HttpStatus.UNAUTHORIZED);

    // Should fail on disabled check before password check
    expect(body2.code).toBe('invalid-credentials');
  });
});
