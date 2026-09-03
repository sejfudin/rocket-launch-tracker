import { Module } from '@nestjs/common';

import { PushNotificationModule } from '~common/push-notifications';

import { UserPushNotificationController } from './user-push-notification.controller';

@Module({
  imports: [PushNotificationModule.forFeature()],
  controllers: [UserPushNotificationController],
})
export class UserPushNotificationModule {}
