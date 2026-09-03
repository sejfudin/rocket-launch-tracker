import { Module } from '@nestjs/common';

import { PrismaModule } from '~database/prisma';

import { ActivityAdminModule } from '~modules/admin/activity';
import { AdminUserAdminModule } from '~modules/admin/admins/admin';
import { AdminUserAuthForgotPasswordModule } from '~modules/admin/admins/auth/providers/local/forgot-password';
import { AdminUserAuthMagicLinkModule } from '~modules/admin/admins/auth/providers/local/magic-link';
import { AdminUserAuthPasswordModule } from '~modules/admin/admins/auth/providers/local/password';
import { AdminUserMeModule } from '~modules/admin/admins/me';
import { AdminUserPushNotificationModule } from '~modules/admin/admins/push-notifications';
import { AdminUserModule } from '~modules/admin/admins/user';
import { AdminUserPrismaRepositoryPlugin } from '~modules/admin/admins/user/persistors/prisma';
import { EmailActivityAdminModule } from '~modules/admin/email/activity';
import { EmailCustomTemplateAdminModule } from '~modules/admin/email/custom-template';
import { EmailAdminSendModule } from '~modules/admin/email/send';
import { EmailSystemTemplateAdminModule } from '~modules/admin/email/system-template';
import { MediaAdminModule } from '~modules/admin/media';
import { PushNotificationActivityAdminModule } from '~modules/admin/push-notification/activity';
import { PushNotificationCustomTemplateAdminModule } from '~modules/admin/push-notification/custom-template';
import { PushNotificationAdminDeviceTokenModule } from '~modules/admin/push-notification/device-token';
import { PushNotificationAdminSendModule } from '~modules/admin/push-notification/send';
import { PushNotificationSystemTemplateAdminModule } from '~modules/admin/push-notification/system-template';
import { QueueAdminModule } from '~modules/admin/queue/queue-admin.module';
import { RocketAdminModule } from '~modules/admin/rocket/rocket-admin.module';
import { SettingsAdminModule } from '~modules/admin/settings';
import { UserAdminModule } from '~modules/admin/user';

@Module({
  imports: [
    PrismaModule.forFeature([
      //
      AdminUserPrismaRepositoryPlugin,
    ]),

    // admin user with access to admin apis
    AdminUserModule,
    AdminUserAuthPasswordModule,
    //AdminUserAuthForgotPasswordModule,
    //AdminUserAuthMagicLinkModule,
    AdminUserPushNotificationModule,
    AdminUserMeModule,

    // management apis
    AdminUserAdminModule,
    UserAdminModule,
    ActivityAdminModule,
    MediaAdminModule,

    PushNotificationAdminSendModule,
    PushNotificationAdminDeviceTokenModule,
    PushNotificationSystemTemplateAdminModule,
    PushNotificationCustomTemplateAdminModule,
    PushNotificationActivityAdminModule,

    EmailAdminSendModule,
    EmailSystemTemplateAdminModule,
    EmailCustomTemplateAdminModule,
    EmailActivityAdminModule,

    SettingsAdminModule,

    QueueAdminModule,

    RocketAdminModule,
  ],
})
export class AdminModule {}
