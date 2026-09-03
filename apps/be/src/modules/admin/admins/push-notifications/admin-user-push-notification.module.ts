import { Module } from '@nestjs/common';

import { PushNotificationModule } from '~common/push-notifications';

import { AdminUserPushNotificationController } from './admin-user-push-notification.controller';

@Module({
  imports: [PushNotificationModule.forFeature()],
  controllers: [AdminUserPushNotificationController],
})
export class AdminUserPushNotificationModule {}
