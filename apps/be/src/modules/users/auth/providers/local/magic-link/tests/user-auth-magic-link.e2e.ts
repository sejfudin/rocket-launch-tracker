import { Controller, Get, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnIdentity, AuthnModule, IAuthnIdentity } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { getConfig } from '~common/config';
import { EmailModule } from '~common/email';
import { HtmlEmailCompilerPlugin } from '~common/email/compilers/html.email-compiler';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { EmailServiceMock } from '~common/email/tests/email.mock';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { USER_AUTH_REST_PREFIX, UserAuthModule, UserRoleCheck } from '~modules/users/auth';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserAuthForgotPasswordModule } from '~modules/users/auth/providers/local/forgot-password';
import { UserAuthMagicLinkModule } from '~modules/users/auth/providers/local/magic-link';
import { UserAuthPasswordModule } from '~modules/users/auth/providers/local/password';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { UserModule, UserRole } from '~modules/users/user';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';
import { UserFixture } from '~modules/users/user/tests/user.fixture';
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

describe('User Auth Magic Link', () => {
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
        overrideProviders: [
          EmailServiceMock,
          [
            UserAuthConfig,
            {
              ...getConfig(UserAuthConfig),
              redirectUrl: '/test',
            },
          ],
        ],
      },
    );
    prismaService = app.get(PrismaService);
  });

  it('should generate magic link and consume it successfully', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client);

    let code: string | null = null;
    let type: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      type = extracted.get('type');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .get(`/${USER_AUTH_REST_PREFIX}/magic-link`)
      .query({ email: user.email })
      .expect(HttpStatus.OK);

    expect(code).toBeDefined();
    expect(type).toBe('magic');

    const { body } = await request(app.getHttpServer())
      .get(`/${USER_AUTH_REST_PREFIX}/magic-link/callback`)
      .query({ type, code })
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK);

    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it('should redirect when Accept header does not include application/json', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client);

    let code: string | null = null;
    let type: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      type = extracted.get('type');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .get(`/${USER_AUTH_REST_PREFIX}/magic-link`)
      .query({ email: user.email })
      .expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .get(`/${USER_AUTH_REST_PREFIX}/magic-link/callback`)
      .query({ type, code })
      .set('Accept', 'text/html')
      .expect(HttpStatus.FOUND);

    expect(response.headers.location).toBeDefined();
  });

  it('should reject invalid magic link code', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get(`/${USER_AUTH_REST_PREFIX}/magic-link/callback`)
      .query({ type: 'magic', code: 'invalid-code' })
      .set('Accept', 'application/json')
      .expect(HttpStatus.BAD_REQUEST);

    expect(body.code).toBeDefined();
  });

  it('should reject magic link for disabled user', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client, { disabledAt: new Date() });

    let code: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .get(`/${USER_AUTH_REST_PREFIX}/magic-link`)
      .query({ email: user.email })
      .expect(HttpStatus.BAD_REQUEST);

    expect(code).toBeNull();
  });
});
