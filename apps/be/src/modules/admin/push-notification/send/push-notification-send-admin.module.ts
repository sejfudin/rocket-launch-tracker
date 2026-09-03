import { Module } from '@nestjs/common';

import { PushNotificationModule } from '~common/push-notifications';

import { PushNotificationAdminSendController } from './push-notification-send-admin.controller';
import { PushNotificationAdminSendService } from './push-notification-send-admin.service';

@Module({
  imports: [PushNotificationModule.forFeature()],
  controllers: [PushNotificationAdminSendController],
  providers: [PushNotificationAdminSendService],
})
export class PushNotificationAdminSendModule {}
