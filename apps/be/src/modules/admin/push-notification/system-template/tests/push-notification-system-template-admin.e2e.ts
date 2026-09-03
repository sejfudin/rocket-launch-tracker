import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { PushNotificationModule } from '~common/push-notifications';
import {
  PushNotificationLogDetail,
  PushNotificationLogLevel,
  PushNotificationMode,
  PushNotificationTemplateType,
} from '~common/push-notifications/models';
import {
  PrismaPushNotificationTemplatePersistorPlugin,
  PrismaPushNotificationTokenPersistorPlugin,
} from '~common/push-notifications/persistors/prisma';
import { PushNotificationTokenFixture } from '~common/push-notifications/persistors/prisma/tests/push-notification-token.fixture';
import { PushNotificationConfig } from '~common/push-notifications/push-notification.config';
import { PushNotificationLoader } from '~common/push-notifications/push-notification.loader';
import { PushNotificationProvider } from '~common/push-notifications/push-notification-provider.abstract';
import {
  MyPushNotificationTemplate,
  MyPushNotificationTemplateProvider,
} from '~common/push-notifications/tests/push-notificaiton-template.mock';
import { PushNotificationProviderMock } from '~common/push-notifications/tests/push-notification.mock';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { PushNotificationSystemTemplateAdminModule } from '~modules/admin/push-notification/system-template';

import { PushNotificationAdminSendModule } from '../../send/push-notification-send-admin.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('PushNotificationSystemTemplateAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;
  let pushNotificationLoader: PushNotificationLoader;
  let providerSendMessage: typeof PushNotificationProviderMock.useValue.sendMessage;
  let pushNotificationTokenFixture: PushNotificationTokenFixture;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
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

          PushNotificationSystemTemplateAdminModule,
          PushNotificationAdminSendModule,
        ],
        providers: [MyPushNotificationTemplateProvider],
      },
      {
        overrideProviders: [
          [
            PushNotificationConfig,
            {
              defaultProvider: PushNotificationProviderMock.provider,
              mode: PushNotificationMode.ENABLED,
              logDetail: PushNotificationLogDetail.CONTENT,
              logLevel: PushNotificationLogLevel.DEBUG,
            },
          ],
        ],
      },
    );
    prismaService = app.get(PrismaService);
    pushNotificationLoader = app.get(PushNotificationLoader);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['push-notification-manager'] });

    // Register mock provider
    pushNotificationLoader.providers = {
      [PushNotificationProviderMock.provider]: PushNotificationProviderMock.useValue as PushNotificationProvider,
    };

    providerSendMessage = PushNotificationProviderMock.useValue.sendMessage;

    pushNotificationTokenFixture = await PushNotificationTokenFixture.fromPartial(prismaService.client, {
      token: 'test-token',
      provider: PushNotificationProviderMock.provider,
      resourceName: 'test-resource',
    });
  });

  afterEach(async () => {
    providerSendMessage.mock.resetCalls();
  });

  it('should fetch system templates', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get('/admin/notify/templates/system')
      .query({ limit: 20, 'filter[names]': MyPushNotificationTemplate.name })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([expect.objectContaining({ name: MyPushNotificationTemplate.name })]),
        totalItems: 1,
        page: 1,
        limit: expect.any(Number),
      }),
    );
  });

  it('should update and send a system template', async ({ expect }) => {
    const updateData = {
      title: 'Hello again {{name}}',
      imageUrl: 'https://example.com/updated.jpg',
      description: 'Updated description',
      data: {
        custom: 5,
      },
    };

    const { body: body1 } = await request(app.getHttpServer())
      .get(`/admin/notify/templates/system/${MyPushNotificationTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body1).toEqual(
      expect.objectContaining({
        id: MyPushNotificationTemplate.name,
        name: MyPushNotificationTemplate.name,
        title: MyPushNotificationTemplate.title,
        body: MyPushNotificationTemplate.body,
        type: PushNotificationTemplateType.SYSTEM,
        data: {
          custom: 10,
        },
      }),
    );

    // send template

    const sendData = {
      resourceName: pushNotificationTokenFixture.entity.resourceName,
      templateName: MyPushNotificationTemplate.name,
      templateVariables: [{ param: 'name', value: 'John Doe' }],
    };

    await request(app.getHttpServer())
      .post('/admin/notify/templates/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(201);

    expect(providerSendMessage.mock.calls[0]?.arguments?.[0]).toEqual(
      expect.objectContaining({
        body: MyPushNotificationTemplate.body?.replace('{{name}}', 'John Doe'),
        title: MyPushNotificationTemplate.title?.replace('{{name}}', 'John Doe'),
        data: {
          custom: 10,
        },
        provider: PushNotificationProviderMock.provider,
      }),
    );

    // update template
    const { body } = await request(app.getHttpServer())
      .put(`/admin/notify/templates/system/${MyPushNotificationTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .send(updateData)
      .expect(200);

    expect(body).toEqual(
      expect.objectContaining({
        id: MyPushNotificationTemplate.name,
        name: MyPushNotificationTemplate.name,
        ...updateData,
        type: PushNotificationTemplateType.SYSTEM,
      }),
    );

    // send template again
    await request(app.getHttpServer())
      .post('/admin/notify/templates/send')
      .set('Authorization', admin.authorizationHeader)
      .send(sendData)
      .expect(201);

    expect(providerSendMessage.mock.calls[1]?.arguments?.[0]).toEqual(
      expect.objectContaining({
        data: {
          custom: 5,
        },
        title: updateData.title.replace('{{name}}', 'John Doe'),
        imageUrl: updateData.imageUrl,
      }),
    );

    // after deletion, the template should be system template again
    await request(app.getHttpServer())
      .delete(`/admin/notify/templates/system/${MyPushNotificationTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(204);

    const getResponseAfterDeletion = await request(app.getHttpServer())
      .get(`/admin/notify/templates/system/${MyPushNotificationTemplate.name}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(getResponseAfterDeletion.body).toEqual(
      expect.objectContaining({
        name: MyPushNotificationTemplate.name,
        title: MyPushNotificationTemplate.title,
        body: MyPushNotificationTemplate.body,
        type: PushNotificationTemplateType.SYSTEM,
        data: {
          custom: 10,
        },
      }),
    );
  });

  it('should return 404 when getting non-existent system template', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get(`/admin/notify/templates/system/non-existent-template-${makeId()}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(404);

    expect(body).toEqual(
      expect.objectContaining({
        code: 'not-found',
      }),
    );
  });

  it('should filter system templates by search query', async ({ expect }) => {
    const { body } = await request(app.getHttpServer())
      .get('/admin/notify/templates/system')
      .query({ 'filter[search]': MyPushNotificationTemplate.name })
      .set('Authorization', admin.authorizationHeader)
      .expect(200);

    expect(body).toBeDefined();
    expect(body.items).toBeInstanceOf(Array);

    const searchTemplate = body.items.find((item: { name: string }) => item.name === MyPushNotificationTemplate.name);
    expect(searchTemplate).toBeDefined();
  });
});
