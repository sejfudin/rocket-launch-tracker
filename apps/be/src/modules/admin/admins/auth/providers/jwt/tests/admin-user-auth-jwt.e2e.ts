import { Controller, Get, HttpStatus, INestApplication } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnIdentity, AuthnModule, IAuthnIdentity } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { getConfig } from '~common/config';
import { StatusResponseDto } from '~common/http/dtos';

import { PrismaService } from '~database/prisma';
import { PrismaClient } from '~database/prisma/client';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserCheck } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';
import { ADMIN_USER_AUTH_JWT_AUDIENCE } from '~modules/admin/admins/auth/admin-user-auth.constants';
import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma/admin-user.prisma-repository';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

@Controller('test')
export class AdminUserAuthJwtDisabledTestController {
  @AdminUserCheck()
  @Get('protected')
  async protected(@AuthnIdentity() _identity: IAuthnIdentity): Promise<StatusResponseDto> {
    return StatusResponseDto.fromDomain({ message: 'success' });
  }
}

describe('Admin User Auth JWT', () => {
  let app: INestApplication;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [
        PrismaEphemeralModule.forRoot([AdminUserPrismaRepositoryPlugin]),

        AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
        AuthzModule.forRoot([]),

        AdminUserModule,
        AdminUserAuthJwtModule,
      ],
      controllers: [AdminUserAuthJwtDisabledTestController],
    });

    prismaClient = app.get(PrismaService).client;
  });

  it('should reject JWT token when admin user authn identity is disabled', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient, {
      disabledAt: new Date(),
    });

    const { body } = await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', adminUser.authorizationHeader)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBeDefined();
  });

  it('should allow JWT token when admin user authn identity is not disabled', async ({ expect }) => {
    const adminUser = await AdminUserFixture.fromPartial(prismaClient);

    const { body } = await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', adminUser.authorizationHeader)
      .expect(HttpStatus.OK);

    expect(body.message).toBe('success');
  });

  it('should reject invalid and malformed tokens', async ({ expect }) => {
    const adminUserAuthConfig = getConfig(AdminUserAuthConfig);
    const adminUser = await AdminUserFixture.fromPartial(prismaClient);

    const invalidTokens = [
      // Format/parsing issues
      { header: 'Bearer ', description: 'empty token' },
      { header: 'Bearer not.a.valid.jwt.token', description: 'malformed JWT' },
      // Missing Bearer prefix
      {
        header: sign(
          { sub: adminUser.authnIdentity!.entity.id, uid: adminUser.entity.id, aud: ADMIN_USER_AUTH_JWT_AUDIENCE },
          adminUserAuthConfig.secret,
          { expiresIn: '1h' },
        ),
        description: 'missing Bearer prefix',
      },
      // Validation issues
      {
        header: `Bearer ${sign(
          { sub: adminUser.authnIdentity!.entity.id, uid: adminUser.entity.id, aud: ADMIN_USER_AUTH_JWT_AUDIENCE },
          'wrong-secret-key',
          { expiresIn: '1h' },
        )}`,
        description: 'wrong signature',
      },
      {
        header: `Bearer ${sign(
          { sub: adminUser.authnIdentity!.entity.id, uid: adminUser.entity.id, aud: ADMIN_USER_AUTH_JWT_AUDIENCE },
          adminUserAuthConfig.secret,
          { expiresIn: '-1h' },
        )}`,
        description: 'expired token',
      },
      {
        header: `Bearer ${sign(
          { sub: adminUser.authnIdentity!.entity.id, uid: adminUser.entity.id, aud: 'wrong-audience' },
          adminUserAuthConfig.secret,
          { expiresIn: '1h' },
        )}`,
        description: 'wrong audience',
      },
      {
        header: `Bearer ${sign(
          { sub: '00000000-0000-0000-0000-000000000000', uid: adminUser.entity.id, aud: ADMIN_USER_AUTH_JWT_AUDIENCE },
          adminUserAuthConfig.secret,
          { expiresIn: '1h' },
        )}`,
        description: 'non-existent authn identity',
      },
    ];

    for (const { header, description } of invalidTokens) {
      const { body, status } = await request(app.getHttpServer()).get('/test/protected').set('Authorization', header);

      expect(status, `Failed for: ${description}`).toBe(HttpStatus.UNAUTHORIZED);
      expect(body.code, `Failed for: ${description}`).toBeDefined();
    }
  });

  it('should reject tampered token (modified payload)', async ({ expect }) => {
    const adminUserAuthConfig = getConfig(AdminUserAuthConfig);
    const adminUser = await AdminUserFixture.fromPartial(prismaClient);

    // Create valid token
    const validToken = sign(
      {
        sub: 'fake-authn-id',
        uid: adminUser.entity.id,
        aud: ADMIN_USER_AUTH_JWT_AUDIENCE,
      },
      adminUserAuthConfig.secret,
      {
        expiresIn: '1h',
      },
    );

    // Tamper with the token by modifying the payload part
    const parts = validToken.split('.');
    expect(parts.length).toBe(3);

    // Decode, modify, and re-encode the payload (but signature will be invalid)
    const tamperedToken = `${parts[0]}.${Buffer.from(
      JSON.stringify({ sub: 'tampered-id', uid: adminUser.entity.id, aud: ADMIN_USER_AUTH_JWT_AUDIENCE }),
    ).toString('base64url')}.${parts[2]}`;

    const { body } = await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBeDefined();
  });
});
