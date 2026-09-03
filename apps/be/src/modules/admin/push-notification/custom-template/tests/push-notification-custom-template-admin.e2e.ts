import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { PushNotificationModule } from '~common/push-notifications';
import { PushNotificationTemplateType } from '~common/push-notifications/models';
import {
  PrismaPushNotificationTemplatePersistorPlugin,
  PrismaPushNotificationTokenPersistorPlugin,
} from '~common/push-notifications/persistors/prisma';
import {
  MyPushNotificationTemplate,
  MyPushNotificationTemplateProvider,
} from '~common/push-notifications/tests/push-notificaiton-template.mock';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { PushNotificationCustomTemplateAdminModule } from '~modules/admin/push-notification/custom-template/push-notification-custom-template-admin.module';
import { PushNotificationSendAdminRequest } from '~modules/admin/push-notification/send';

import { PushNotificationTemplateFixture } from '../../../../../common/push-notifications/persistors/prisma/tests/push-notification-template.fixture';
import { PushNotificationAdminSendModule } from '../../send/push-notification-send-admin.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('PushNotificationCustomTemplateAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [
        PrismaEphemeralModule.forRoot([AdminUserPrismaRepositoryPlugin]),
        AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
        AuthzModule.forRoot([]),
        AdminUserModule,
        AdminUserAuthJwtModule,

        PushNotificationModule.forRoot([
          PrismaPushNotificationTemplatePersistorPlugin,
          PrismaPushNotificationTokenPersistorPlugin,
        ]),

        PushNotificationCustomTemplateAdminModule,
        PushNotificationAdminSendModule,
      ],
      providers: [MyPushNotificationTemplateProvider],
    });
    prismaService = app.get(PrismaService);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['push-notification-manager'] });
  });

  afterEach(async () => {
    await prismaService.client.pushNotificationTemplate.deleteMany();
  });

  it('should fetch custom templates', async ({ expect }) => {
    const name = `test-custom-template-${makeId()}`;
    const template = await PushNotificationTemplateFixture.fromPartial(prismaService.client, {
      name,
      type: PushNotificationTemplateType.CUSTOM,
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/notify/templates/custom')
      .query({ 'filter[type]': PushNotificationTemplateType.CUSTOM, limit: 20, 'filter[names]': name })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([expect.objectContaining({ name })]),
        totalItems: 1,
        page: 1,
        limit: expect.any(Number),
      }),
    );

    const customTemplate = body.items.find((item: { name: string }) => item.name === template.entity.name);
    expect(customTemplate).toBeDefined();
    expect(customTemplate).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: template.entity.name,
        type: PushNotificationTemplateType.CUSTOM,
        title: 'Test Template Title',
      }),
    );
  });

  it('should create a custom template', async ({ expect }) => {
    const createData = {
      name: `test-create-template-${makeId()}`,
      title: 'New Custom Template Title',
      body: 'New Custom Template Body',
      imageUrl: 'https://example.com/image.jpg',
      description: 'A new custom template',
      module: 'test-module',
    };

    const { body } = await request(app.getHttpServer())
      .post('/admin/notify/templates/custom')
      .set('Authorization', admin.authorizationHeader)
      .send(createData)
      .expect(201);

    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: createData.name,
        title: createData.title,
        body: createData.body,
        imageUrl: createData.imageUrl,
        description: createData.description,
        module: createData.module,
        type: PushNotificationTemplateType.CUSTOM,
      }),
    );
  });

  it('should not create a custom template with system template name', async ({ expect }) => {
    const createData = {
      name: MyPushNotificationTemplate.name,
      title: 'Custom Template Title',
      body: 'Custom Template Body',
      imageUrl: 'https://example.com/image.jpg',
    };

    const { body } = await request(app.getHttpServer())
      .post('/admin/notify/templates/custom')
      .set('Authorization', admin.authorizationHeader)
      .send(createData)
      .expect(400);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'custom-template-name-conflict',
      }),
    );
  });

  it('should get a custom template by name', async ({ expect }) => {
    const template = await PushNotificationTemplateFixture.fromPartial(prismaService.client, {
      name: `test-get-template-${makeId()}`,
      title: 'Get Template Title',
      body: 'Get Template Body',
      type: PushNotificationTemplateType.CUSTOM,
    });

    const { body } = await request(app.getHttpServer())
      .get(`/admin/notify/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: template.entity.name, // id is the name
        name: template.entity.name,
        title: 'Get Template Title',
        body: 'Get Template Body',
        type: PushNotificationTemplateType.CUSTOM,
      }),
    );
  });

  it('should update a custom template', async ({ expect }) => {
    const template = await PushNotificationTemplateFixture.fromPartial(prismaService.client, {
      name: `test-update-template-${makeId()}`,
      title: 'Original Title',
      body: 'Original Body',
      type: PushNotificationTemplateType.CUSTOM,
    });

    const updateData = {
      title: 'Updated Title',
      body: 'Updated Body',
      imageUrl: 'https://example.com/updated.jpg',
      description: 'Updated description',
    };

    const { body } = await request(app.getHttpServer())
      .put(`/admin/notify/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: template.entity.name, // id is the name
        name: template.entity.name,
        title: 'Updated Title',
        body: 'Updated Body',
        imageUrl: 'https://example.com/updated.jpg',
        description: 'Updated description',
        type: PushNotificationTemplateType.CUSTOM,
      }),
    );
  });

  it('should delete a custom template', async ({ expect }) => {
    const template = await PushNotificationTemplateFixture.fromPartial(prismaService.client, {
      name: `test-delete-template-${makeId()}`,
      type: PushNotificationTemplateType.CUSTOM,
    });

    await request(app.getHttpServer())
      .delete(`/admin/notify/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(204);

    const { body } = await request(app.getHttpServer())
      .get(`/admin/notify/templates/custom/${template.entity.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should send push notification using custom template', async () => {
    const sendData: PushNotificationSendAdminRequest = {
      resourceName: 'test-resource',
      title: 'Hello John',
      body: 'Hello John, welcome!',
    } as PushNotificationSendAdminRequest;

    await request(app.getHttpServer())
      .post('/admin/notify/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(200);
  });

  it('should return 404 when getting non-existent custom template', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get(`/admin/notify/templates/custom/non-existent-template-${makeId()}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should return 404 when updating non-existent custom template', async ({ expect }) => {
    const updateData = {
      title: 'Updated Title',
      body: 'Updated Body',
      imageUrl: 'https://example.com/image.jpg',
    };

    const { body } = await request(app.getHttpServer())
      .put(`/admin/notify/templates/custom/non-existent-template-${makeId()}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should filter custom templates by search query', async ({ expect }) => {
    const template1 = await PushNotificationTemplateFixture.fromPartial(prismaService.client, {
      name: `search-custom-1-${makeId()}`,
      title: 'Search Custom Template',
      type: PushNotificationTemplateType.CUSTOM,
    });

    const template2 = await PushNotificationTemplateFixture.fromPartial(prismaService.client, {
      name: `other-custom-${makeId()}`,
      title: 'Other Custom Template',
      type: PushNotificationTemplateType.CUSTOM,
    });

    const { body } = await request(app.getHttpServer())
      .get('/admin/notify/templates/custom')
      .query({ 'filter[search]': 'search-custom' })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toBeDefined();
    expect(body.items).toBeInstanceOf(Array);

    const searchTemplate = body.items.find((item: { name: string }) => item.name === template1.entity.name);
    const otherTemplate = body.items.find((item: { name: string }) => item.name === template2.entity.name);

    expect(searchTemplate).toBeDefined();
    expect(otherTemplate).toBeUndefined();
  });
});
