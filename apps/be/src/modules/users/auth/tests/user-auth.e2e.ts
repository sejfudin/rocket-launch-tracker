import { Controller, Get, HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnIdentity, AuthnModule, IAuthnIdentity } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';

import { PrismaService } from '~database/prisma';
import { PrismaClient } from '~database/prisma/client';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { USER_AUTHN_KEY, UserAclCheck, UserRoleCheck } from '~modules/users/auth';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserModule } from '~modules/users/user';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';
import { UserFixture } from '~modules/users/user/tests/user.fixture';
import { UserRole } from '~modules/users/user/user.constants';
import { UserService } from '~modules/users/user/user.service';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

@Controller('test')
export class UserAuthTestController {
  constructor(private readonly userService: UserService) {}

  @UserAclCheck('rocket:read')
  @Get('rockets')
  async read(@AuthnIdentity(USER_AUTHN_KEY) _identity: IAuthnIdentity): Promise<void> {}

  @UserAclCheck('rocket:edit')
  @Get('rockets')
  async edit(): Promise<void> {}

  @UserRoleCheck(UserRole.manager)
  @Get('manager')
  async manage(@AuthnIdentity() identity: IAuthnIdentity): Promise<void> {
    const user = await this.userService.find({ id: identity.userId });

    if (!user?.roles.includes('manager' as any)) {
      throw new Error('Not manager');
    }
  }
}

describe('UserAuth', () => {
  let app: INestApplication;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [
        PrismaEphemeralModule.forRoot([UserPrismaRepositoryPlugin]),

        AuthzModule.forRoot([]),
        AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
        UserModule,
        UserAuthJwtModule,
      ],
      controllers: [UserAuthTestController],
    });

    prismaClient = app.get(PrismaService).client;
  });

  it('should protect endpoint by acl and role', async () => {
    const user = await UserFixture.fromPartial(prismaClient, { roles: ['client'] });

    await request(app.getHttpServer())
      .get('/test/rockets')
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .get('/test/manager')
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.FORBIDDEN);

    const employee = await UserFixture.fromPartial(prismaClient, { roles: ['manager'] });

    await request(app.getHttpServer())
      .get('/test/rockets')
      .set('Authorization', employee.authorizationHeader)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get('/test/manager')
      .set('Authorization', employee.authorizationHeader)
      .expect(HttpStatus.OK);
  });
});
