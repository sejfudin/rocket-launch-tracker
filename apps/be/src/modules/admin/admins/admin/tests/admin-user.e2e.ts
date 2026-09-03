import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { type AdminUserAuthPasswordAndSecretRegisterRequest } from '~modules/admin/admins/admin/models/admin-user-password-and-secret-register.request';
import { AdminConfig } from '~modules/admin/admins/admin.config';
import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { type AdminUserAuthPasswordRegisterRequest } from '~modules/admin/admins/auth/providers/local/password/models/admin-user-auth-password-register.request';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';

import { ADMIN_USER_REST_PREFIX } from '../../admin.constants';
import { type AdminUserUpdateRequest } from '../../user/models/admin-user-update.request';
import { AdminUserFixture } from '../../user/tests/admin-user.fixture';
import { AdminUserAdminModule } from '../admin-user.admin.module';
import { createAppTestingModule } from '~test/utils';

describe('AdminUserAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;
  let adminSecret = 'secret-admin-string';

  beforeAll(async () => {
    app = await createAppTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forFeature([AdminUserPrismaRepositoryPlugin]),
          AdminUserModule,
          AdminUserAuthJwtModule,
          AdminUserAdminModule,
        ],
      },
      {
        overrideProviders: [[AdminConfig, { createSecret: adminSecret }]],
      },
    );
    prismaService = app.get(PrismaService);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['admin-user-manager'] });
  });

  it('should create a new admin user when password longer or equal than 12 char', async ({ expect }) => {
    const email = `${makeId()}@test.test`.toLowerCase().trim();
    const response = await request(app.getHttpServer())
      .post(`/admin/${ADMIN_USER_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Test Test',
        email,
        roles: ['user-manager'],
        password: 'asdasdasdasd',
      } satisfies AdminUserAuthPasswordRegisterRequest)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Test Test',
        email,
        roles: ['user-manager'],
      }),
    );
  });

  it('should fail to create a new admin user when email already exist', async () => {
    const data = {
      email: `${makeId()}@test.test`,
      name: 'Test Test',
      password: 'testtdsfgdst',
      roles: ['user-manager'],
    } satisfies AdminUserAuthPasswordRegisterRequest;

    await request(app.getHttpServer())
      .post(`/admin/${ADMIN_USER_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send(data);

    const { body } = await request(app.getHttpServer())
      .post(`/admin/${ADMIN_USER_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send(data)
      .expect(409);

    expect(body.code).toEqual('identity-already-exists');
  });

  it('should fail to create a new admin user when password shorter than 8 char', async () => {
    const email = `${makeId()}@test.test`;

    const { body } = await request(app.getHttpServer())
      .post(`/admin/${ADMIN_USER_REST_PREFIX}/`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Test Test',
        email,
        roles: [],
        password: 'testtst',
      } satisfies AdminUserAuthPasswordRegisterRequest)
      .expect(400);

    expect(body.code).toEqual('validation-exception');
  });

  it('should create a new admin user with secret', async ({ expect }) => {
    const email = `${makeId()}@test.test`.toLowerCase().trim();

    const response = await request(app.getHttpServer())
      .post(`/admin/${ADMIN_USER_REST_PREFIX}/create-with-secret`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Test Test',
        email,
        roles: ['general-manager'],
        password: 'testtest',
        secret: adminSecret,
      } satisfies AdminUserAuthPasswordAndSecretRegisterRequest)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        name: 'Test Test',
        email,
        roles: ['general-manager'],
      }),
    );
  });

  it('should fail to create a new admin user with wrong secret', async ({ expect }) => {
    const email = `${makeId()}@test.test`;

    const response = await request(app.getHttpServer())
      .post(`/admin/${ADMIN_USER_REST_PREFIX}/create-with-secret`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Test Test',
        email,
        roles: ['general-manager'],
        password: 'testtest',
        secret: 'wrong-secret',
      } satisfies AdminUserAuthPasswordAndSecretRegisterRequest)
      .expect(400);

    expect(response.body.code).toEqual('invalid-secret');
  });

  it('should get a admin user', async ({ expect }) => {
    const adminUserFixture = await AdminUserFixture.fromPartial(prismaService.client, {
      name: 'Test Test',
      roles: ['general-manager'],
    });

    const response = await request(app.getHttpServer())
      .get(`/admin/${ADMIN_USER_REST_PREFIX}/${adminUserFixture.entity.id}`)
      .set('Authorization', admin.authorizationHeader)
      .send()
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: adminUserFixture.entity.id,
        name: 'Test Test',
        email: adminUserFixture.email,
        roles: ['general-manager'],
      }),
    );
  });

  it('should update a admin user', async ({ expect }) => {
    const adminUserFixture = await AdminUserFixture.fromPartial(prismaService.client, {
      name: 'Test Test',
      roles: ['general-manager'],
    });

    const response = await request(app.getHttpServer())
      .put(`/admin/${ADMIN_USER_REST_PREFIX}/${adminUserFixture.entity.id}`)
      .set('Authorization', admin.authorizationHeader)
      .send({
        name: 'Blue Test',
        roles: ['general-manager'],
      } satisfies AdminUserUpdateRequest)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: adminUserFixture.entity.id,
        name: 'Blue Test',
        roles: ['general-manager'],
      }),
    );
  });

  it('should delete a admin user', async () => {
    const adminUserFixture = await AdminUserFixture.fromPartial(prismaService.client, {
      roles: ['general-manager'],
    });

    await request(app.getHttpServer())
      .delete(`/admin/${ADMIN_USER_REST_PREFIX}/${adminUserFixture.entity.id}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(204);
  });
});
