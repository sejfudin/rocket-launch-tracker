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

import { ADMIN_USER_AUTH_REST_PREFIX, AdminUserCheck } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';
import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserAuthForgotPasswordModule } from '~modules/admin/admins/auth/providers/local/forgot-password';
import { AdminUserAuthMagicLinkModule } from '~modules/admin/admins/auth/providers/local/magic-link';
import { AdminUserAuthPasswordModule } from '~modules/admin/admins/auth/providers/local/password';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserService } from '~modules/admin/admins/user/admin-user.service';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma/admin-user.prisma-repository';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

@Controller('test')
export class AdminUserAuthnLocalTestController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Get('resource')
  @AdminUserCheck()
  async user(@AuthnIdentity() identity: IAuthnIdentity): Promise<void> {
    const user = await this.adminUserService.find({ id: identity.userId });
    if (!user) {
      throw new Error('Not admin user');
    }
  }
}

describe('Admin User Auth Magic Link', () => {
  let app: INestApplication;
  const emailService = EmailServiceMock.useValue;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forRoot([AdminUserPrismaRepositoryPlugin]),

          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          AuthzModule.forRoot([]),

          EmailModule.forRoot([NoOpEmailProviderPlugin, HtmlEmailCompilerPlugin]),

          AdminUserModule,
          AdminUserAuthJwtModule,
          AdminUserAuthMagicLinkModule,
          AdminUserAuthForgotPasswordModule,
          AdminUserAuthPasswordModule,
        ],
        controllers: [AdminUserAuthnLocalTestController],
      },
      {
        overrideProviders: [
          EmailServiceMock,
          [AdminUserAuthConfig, { ...getConfig(AdminUserAuthConfig), redirectUrl: '/test' }],
        ],
      },
    );
    prismaService = app.get(PrismaService);
  });

  it('should generate magic link and consume it successfully', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaService.client);

    let code: string | null = null;
    let type: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      type = extracted.get('type');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .get(`/${ADMIN_USER_AUTH_REST_PREFIX}/magic-link`)
      .query({ email: adminUser.email })
      .expect(HttpStatus.OK);

    expect(code).toBeDefined();
    expect(type).toBe('magic');

    const { body } = await request(app.getHttpServer())
      .get(`/${ADMIN_USER_AUTH_REST_PREFIX}/magic-link/callback`)
      .query({ type, code })
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK);

    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it('should redirect when Accept header does not include application/json', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaService.client);

    let code: string | null = null;
    let type: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      type = extracted.get('type');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .get(`/${ADMIN_USER_AUTH_REST_PREFIX}/magic-link`)
      .query({ email: adminUser.email })
      .expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .get(`/${ADMIN_USER_AUTH_REST_PREFIX}/magic-link/callback`)
      .query({ type, code })
      .set('Accept', 'text/html')
      .expect(HttpStatus.FOUND);

    expect(response.headers.location).toBeDefined();
  });

  it('should reject invalid magic link code', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get(`/${ADMIN_USER_AUTH_REST_PREFIX}/magic-link/callback`)
      .query({ type: 'magic', code: 'invalid-code' })
      .set('Accept', 'application/json')
      .expect(HttpStatus.BAD_REQUEST);

    expect(body.code).toBeDefined();
  });

  it('should reject magic link for disabled user', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaService.client, { disabledAt: new Date() });

    let code: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .get(`/${ADMIN_USER_AUTH_REST_PREFIX}/magic-link`)
      .query({ email: adminUser.email })
      .expect(HttpStatus.BAD_REQUEST);

    expect(code).toBeNull();
  });
});
