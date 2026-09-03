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

import { ADMIN_USER_AUTH_REST_PREFIX, AdminUserCheck } from '~modules/admin/admins/auth';
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

describe('Admin User Auth Forgot Password', () => {
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
        overrideProviders: [EmailServiceMock],
      },
    );
    prismaService = app.get(PrismaService);
  });

  it('should register, forget password and reset password', async () => {
    const adminUser = await AdminUserFixture.fromPartial(prismaService.client);
    const email = adminUser.entity.email;

    await request(app.getHttpServer())
      .get(`/test/resource`)
      .set('Authorization', adminUser.authorizationHeader)
      .expect(HttpStatus.OK);

    let code: string | null = null;
    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, values) => {
      const extracted = new URLSearchParams((values as { url: string }).url.split('?')[1]);
      code = extracted.get('code');
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/forgot-password`)
      .send({ email })
      .expect(HttpStatus.OK);

    const newPassword = 'kz83vn7lwu2ipqxa9mcdt4';

    await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/forgot-password/callback`)
      .send({ password: newPassword, code })
      .expect(HttpStatus.OK);

    const {
      body: { accessToken: newAccessToken },
    } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ password: newPassword, email })
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get(`/test/resource`)
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(HttpStatus.OK);
  });

  it(`should return bad request if email doesn't exist on forgot password`, async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/forgot-password`)
      .send({ email: `test+${makeId()}@admin.com` })
      .expect(HttpStatus.BAD_REQUEST);

    expect(body.code).toEqual('identity-not-found');
  });

  it('should return bad request if token is invalid', async () => {
    const adminUser = await AdminUserFixture.fromPartial(prismaService.client);

    await request(app.getHttpServer())
      .get(`/test/resource`)
      .set('Authorization', adminUser.authorizationHeader)
      .expect(HttpStatus.OK);

    emailService.sendTemplate.mock.mockImplementationOnce(async (_data, _name, _values) => {
      return { status: 'success' };
    });

    await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/forgot-password`)
      .send({ email: adminUser.entity.email })
      .expect(HttpStatus.OK);

    const newPassword = 'kz83vn7lwu2ipqxa9mcdt4';

    await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/forgot-password/callback`)
      .send({ password: newPassword, code: 'fj92xt6qmv7rleodbz51wa' })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
