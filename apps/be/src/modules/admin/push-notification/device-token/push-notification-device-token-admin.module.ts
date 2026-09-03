import { Module } from '@nestjs/common';

import { PushNotificationModule } from '~common/push-notifications';

import { UserModule } from '~modules/users/user';

import { PushNotificationDeviceTokenAdminController } from './push-notification-device-token-admin.controller';
import { PushNotificationDeviceTokenAdminService } from './push-notification-device-token-admin.service';

@Module({
  imports: [UserModule, PushNotificationModule.forFeature()],
  providers: [PushNotificationDeviceTokenAdminService],
  controllers: [PushNotificationDeviceTokenAdminController],
})
export class PushNotificationAdminDeviceTokenModule {}
