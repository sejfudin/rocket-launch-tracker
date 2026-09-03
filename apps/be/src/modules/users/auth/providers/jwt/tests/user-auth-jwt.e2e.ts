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

import { UserCheck } from '~modules/users/auth';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { USER_AUTH_JWT_AUDIENCE } from '~modules/users/auth/user-auth.constants';
import { UserModule } from '~modules/users/user';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';
import { UserFixture } from '~modules/users/user/tests/user.fixture';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

@Controller('test')
export class UserAuthJwtDisabledTestController {
  @UserCheck()
  @Get('protected')
  async protected(@AuthnIdentity() _identity: IAuthnIdentity): Promise<StatusResponseDto> {
    return StatusResponseDto.fromDomain({ message: 'success' });
  }
}

describe('User Auth JWT', () => {
  let app: INestApplication;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [
        PrismaEphemeralModule.forRoot([UserPrismaRepositoryPlugin]),

        AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
        AuthzModule.forRoot([]),

        UserModule,
        UserAuthJwtModule,
      ],
      controllers: [UserAuthJwtDisabledTestController],
    });

    prismaClient = app.get(PrismaService).client;
  });

  it('should reject JWT token when user authn identity is disabled', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaClient, {
      disabledAt: new Date(),
    });

    const { body } = await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBeDefined();
  });

  it('should allow JWT token when user authn identity is not disabled', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaClient);

    const { body } = await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.OK);

    expect(body.message).toBe('success');
  });

  it('should reject invalid and malformed tokens', async ({ expect }) => {
    const userAuthConfig = getConfig(UserAuthConfig);
    const user = await UserFixture.fromPartial(prismaClient);

    const invalidTokens = [
      // Format/parsing issues
      { header: 'Bearer ', description: 'empty token' },
      { header: 'Bearer not.a.valid.jwt.token', description: 'malformed JWT' },
      // Missing Bearer prefix
      {
        header: sign(
          { sub: user.authnIdentity?.entity.id || 'fake-id', uid: user.entity.id, aud: USER_AUTH_JWT_AUDIENCE },
          userAuthConfig.secret,
          { expiresIn: '1h' },
        ),
        description: 'missing Bearer prefix',
      },
      // Validation issues
      {
        header: `Bearer ${sign(
          { sub: user.authnIdentity?.entity.id || 'fake-id', uid: user.entity.id, aud: USER_AUTH_JWT_AUDIENCE },
          'wrong-secret-key',
          { expiresIn: '1h' },
        )}`,
        description: 'wrong signature',
      },
      {
        header: `Bearer ${sign(
          { sub: user.authnIdentity?.entity.id || 'fake-id', uid: user.entity.id, aud: USER_AUTH_JWT_AUDIENCE },
          userAuthConfig.secret,
          { expiresIn: '-1h' },
        )}`,
        description: 'expired token',
      },
      {
        header: `Bearer ${sign(
          { sub: user.authnIdentity?.entity.id || 'fake-id', uid: user.entity.id, aud: 'wrong-audience' },
          userAuthConfig.secret,
          { expiresIn: '1h' },
        )}`,
        description: 'wrong audience',
      },
      {
        header: `Bearer ${sign({ uid: user.entity.id, aud: USER_AUTH_JWT_AUDIENCE }, userAuthConfig.secret, {
          expiresIn: '1h',
        })}`,
        description: 'missing required fields',
      },
      // Non-existent authn identity
      {
        header: `Bearer ${sign(
          { sub: '00000000-0000-0000-0000-000000000000', uid: user.entity.id, aud: USER_AUTH_JWT_AUDIENCE },
          userAuthConfig.secret,
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
    const userAuthConfig = getConfig(UserAuthConfig);
    const user = await UserFixture.fromPartial(prismaClient);

    // Create valid token
    const validToken = sign(
      {
        sub: user.authnIdentity?.entity.id || 'fake-id',
        uid: user.entity.id,
        aud: USER_AUTH_JWT_AUDIENCE,
      },
      userAuthConfig.secret,
      {
        expiresIn: '1h',
      },
    );

    // Tamper with the token by modifying the payload part
    const parts = validToken.split('.');
    expect(parts.length).toBe(3);

    // Decode, modify, and re-encode the payload (but signature will be invalid)
    const tamperedToken = `${parts[0]}.${Buffer.from(
      JSON.stringify({ sub: 'tampered-id', uid: user.entity.id, aud: USER_AUTH_JWT_AUDIENCE }),
    ).toString('base64url')}.${parts[2]}`;

    const { body } = await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(HttpStatus.UNAUTHORIZED);

    expect(body.code).toBeDefined();
  });
});
