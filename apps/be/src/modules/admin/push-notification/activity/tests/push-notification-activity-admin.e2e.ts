import { HttpStatus, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { ActivityModule } from '~common/activities';
import { PrismaActivityPersistorPlugin } from '~common/activities/persistors/prisma';
import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { PushNotificationModule } from '~common/push-notifications';
import {
  PushNotificationLogDetail,
  PushNotificationLogLevel,
  PushNotificationMode,
} from '~common/push-notifications/models';
import { PrismaPushNotificationTokenPersistorPlugin } from '~common/push-notifications/persistors/prisma';
import { PushNotificationTokenFixture } from '~common/push-notifications/persistors/prisma/tests/push-notification-token.fixture';
import { PushNotificationConfig } from '~common/push-notifications/push-notification.config';
import { PushNotificationLoader } from '~common/push-notifications/push-notification.loader';
import { PushNotificationService } from '~common/push-notifications/push-notification.service';
import { PushNotificationProvider } from '~common/push-notifications/push-notification-provider.abstract';
import { PushNotificationProviderMock } from '~common/push-notifications/tests/push-notification.mock';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AdminUserAuthJwtModule } from '~modules/admin/admins/auth/providers/jwt/admin-user-auth-jwt.module';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { AdminUserFixture } from '~modules/admin/admins/user/tests/admin-user.fixture';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';

import { PUSH_NOTIFICATION_ADMIN_REST_PREFIX } from '../../push-notification-admin.constants';
import { PushNotificationActivityAdminModule } from '../push-notification-activity-admin.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

const waitForActivity = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PushNotificationActivityAdmin', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let admin: AdminUserFixture;
  let pushNotificationService: PushNotificationService;
  let pushNotificationLoader: PushNotificationLoader;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forRoot([
            UserPrismaRepositoryPlugin,
            AdminUserPrismaRepositoryPlugin,
            PrismaActivityPersistorPlugin,
          ]),

          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          AuthzModule.forRoot([]),
          ActivityModule.forRoot([PrismaActivityPersistorPlugin]),

          AdminUserModule,
          AdminUserAuthJwtModule,
          PushNotificationModule.forRoot([PrismaPushNotificationTokenPersistorPlugin]),
          PushNotificationActivityAdminModule,
        ],
      },
      {
        overrideProviders: [
          [
            PushNotificationConfig,
            {
              defaultProvider: PushNotificationProviderMock.provider,
              mode: PushNotificationMode.SUPPRESSED,
              logDetail: PushNotificationLogDetail.CONTENT,
              logLevel: PushNotificationLogLevel.DEBUG,
            },
          ],
        ],
      },
    );
    prismaService = app.get(PrismaService);
    admin = await AdminUserFixture.fromPartial(prismaService.client, { roles: ['activity-manager'] });
    pushNotificationService = app.get(PushNotificationService);
    pushNotificationLoader = app.get(PushNotificationLoader);

    // Register mock provider
    pushNotificationLoader.providers = {
      [PushNotificationProviderMock.provider]: PushNotificationProviderMock.useValue as PushNotificationProvider,
    };
  });

  it('should get a push notification activity by id', async ({ expect }) => {
    const tokenFixture = await PushNotificationTokenFixture.fromPartial(prismaService.client, {
      token: 'test-token-1',
      provider: 'fcm',
      resourceName: 'test-resource',
    });

    await pushNotificationService.send({
      tokens: [tokenFixture.entity.token],
      title: 'Test Notification',
      body: 'Test Body',
      data: {
        extra: 'Data',
      },
    });

    // Wait for activity to be created (it's async via setImmediate)
    await waitForActivity(200);

    // Find the activity that was just created
    const {
      body: { items: activities },
    } = await request(app.getHttpServer())
      .get(`/admin/${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}/activities?filter[event]=suppressed`)
      .set('Authorization', admin.authorizationHeader)
      .expect(HttpStatus.OK);

    const activity = activities.find((item: any) => {
      return item.deviceTokens?.includes(tokenFixture.entity.token);
    });

    expect(activity).toBeDefined();

    const { body } = await request(app.getHttpServer())
      .get(`/admin/${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}/activities/${activity!.id}`)
      .set('Authorization', admin.authorizationHeader)
      .expect(HttpStatus.OK);

    expect(body).toEqual(
      expect.objectContaining({
        id: activity!.id,
        module: 'push-notification',
        type: 'push-notification',
        event: 'suppressed',
        deviceTokens: [tokenFixture.entity.token],
        title: 'Test Notification',
        body: 'Test Body',
        data: {
          extra: 'Data',
        },
      }),
    );
  });
});
