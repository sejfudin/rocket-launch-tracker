import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthzModule } from '~common/authz/authz.module';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { type UserAdminUpdateRequest } from '~modules/admin/user/models/user-admin-update.request';
import { type UserAuthPasswordRegisterRequest } from '~modules/users/auth/providers/local/password/models/user-auth-password-register.request';
import { UserFixture } from '~modules/users/user/tests/user.fixture';
import { UserRole } from '~modules/users/user/user.constants';

import { USER_ADMIN_REST_PREFIX } from '../user-admin.constants';
import { UserAdminModule } from '../user-admin.module';
import { createAppTestingModule } from '~test/utils';

describe('UserAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;

  beforeAll(async () => {
    app = await createAppTestingModule({
      imports: [
        PrismaEphemeralModule.forFeature([AdminUserPrismaRepositoryPlugin]),
        AuthzModule.forFeature([]),
        AdminUserModule,
        AdminUserAuthJwtModule,

        UserAdminModule,
      ],
    });
    prismaService = app.get(PrismaService);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['user-manager'] });
  });

  it('should create a new user when password longer or equal than 12 char', async ({ expect }) => {
    const email = `${makeId()}@test.test`.toLowerCase().trim();
    const response = await request(app.getHttpServer())
      .post(`/admin/${USER_ADMIN_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Test Test',
        email,
        password: 'apapapapapapa',
      } satisfies UserAuthPasswordRegisterRequest)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Test Test',
        email,
        roles: ['client'],
      }),
    );
  });

  it('should fail to create a new user when email already exist', async ({ expect }) => {
    const data = {
      email: `${makeId()}@test.test`,
      name: 'Test Test',
      password: 'testtdsfgdst',
    } satisfies UserAuthPasswordRegisterRequest;

    await request(app.getHttpServer())
      .post(`/admin/${USER_ADMIN_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send(data);

    const { body } = await request(app.getHttpServer())
      .post(`/admin/${USER_ADMIN_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send(data);

    expect(body.code).toEqual('identity-already-exists');
  });

  it('should fail to create a new user when password shorter than 12 char', async ({ expect }) => {
    const email = `${makeId()}@test.test`;

    const { body } = await request(app.getHttpServer())
      .post(`/admin/${USER_ADMIN_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Test Test',
        email,
        password: 'testtst',
      } satisfies UserAuthPasswordRegisterRequest)
      .expect(400);

    expect(body.code).toEqual('validation-exception');
  });

  it('should get a user', async ({ expect }) => {
    const email = `${makeId()}@test.test`.toLowerCase().trim();

    const userFixture = await UserFixture.fromPartial(prismaService.client, {
      name: 'Test Test',
      email,
    });

    const response = await request(app.getHttpServer())
      .get(`/admin/${USER_ADMIN_REST_PREFIX}/${userFixture.entity.id}`)
      .set('Authorization', admin.authorizationHeader)
      .send()
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: userFixture.entity.id,
        name: 'Test Test',
        email,
      }),
    );
  });

  it('should update a user', async ({ expect }) => {
    const email = `${makeId()}@test.test`;

    const userFixture = await UserFixture.fromPartial(prismaService.client, {
      name: 'Test Test',
      email,
    });

    const response = await request(app.getHttpServer())
      .put(`/admin/${USER_ADMIN_REST_PREFIX}/${userFixture.entity.id}`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Blue Test',
        roles: [UserRole.client],
      } satisfies UserAdminUpdateRequest)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: userFixture.entity.id,
        name: 'Blue Test',
        roles: [UserRole.client],
      }),
    );
  });

  it('should delete a user', async () => {
    const email = `${makeId()}@test.test`;

    const userFixture = await UserFixture.fromPartial(prismaService.client, {
      name: 'Test Test',
      email,
      roles: ['USER'],
    });

    await request(app.getHttpServer())
      .delete(`/admin/${USER_ADMIN_REST_PREFIX}/${userFixture.entity.id}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(204);
  });
});
