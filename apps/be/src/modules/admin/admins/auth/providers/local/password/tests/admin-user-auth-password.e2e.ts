import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { EmailModule } from '~common/email';
import { HtmlEmailCompilerPlugin } from '~common/email/compilers/html.email-compiler';
import { NoOpEmailProviderPlugin } from '~common/email/providers/no-op';
import { EmailServiceMock } from '~common/email/tests/email.mock';

import { PrismaService } from '~database/prisma';
import { PrismaClient } from '~database/prisma/client';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { ADMIN_USER_AUTH_REST_PREFIX, AdminUserAuthModule } from '~modules/admin/admins/auth';
import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserAuthPasswordModule } from '~modules/admin/admins/auth/providers/local/password';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma/admin-user.prisma-repository';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('Admin User Auth Password', () => {
  let app: INestApplication;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forRoot([AdminUserPrismaRepositoryPlugin]),

          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          AuthzModule.forRoot([]),

          EmailModule.forRoot([NoOpEmailProviderPlugin, HtmlEmailCompilerPlugin]),

          AdminUserModule,
          AdminUserAuthModule,
          AdminUserAuthJwtModule,
          AdminUserAuthPasswordModule,
        ],
      },
      {
        overrideProviders: [EmailServiceMock],
      },
    );

    prismaClient = app.get(PrismaService).client;
  });

  it('should login with valid credentials', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient);

    const { body } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(HttpStatus.OK);

    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it('should reject login with invalid credentials', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient, {});

    const { body } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ email: adminUser.entity.email, password: 'wrongpassword' })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBeDefined();
  });

  it('should reject login when admin user is disabled', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient, { disabledAt: new Date() });

    const { body } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBe('account-disabled');
    expect(body.message).toContain('disabled');
  });

  it('should change password when authenticated', async () => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient);
    const newPassword = 'newpassword123';

    await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/password`)
      .send({ password: newPassword })
      .set('Authorization', adminUser.authorizationHeader)
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ email: adminUser.entity.email, password: newPassword })
      .expect(HttpStatus.OK);
  });

  it('should reject login when admin user authn identity is disabled', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient, {
      disabledAt: new Date(),
    });

    const { body } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBe('account-disabled');
    expect(body.message).toContain('disabled');
  });

  it('should reject login with invalid credentials even if user is disabled', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient, { disabledAt: new Date() });

    const { body } = await request(app.getHttpServer())
      .post(`/${ADMIN_USER_AUTH_REST_PREFIX}/login`)
      .send({ email: adminUser.email, password: 'wrongpassword' })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBe('invalid-credentials');
  });
});
