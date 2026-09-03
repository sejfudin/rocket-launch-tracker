import { Module } from '@nestjs/common';

import { PushNotificationModule } from '~common/push-notifications';

import { PushNotificationCustomTemplateAdminController } from './push-notification-custom-template-admin.controller';
import { PushNotificationCustomTemplateAdminService } from './push-notification-custom-template-admin.service';

@Module({
  imports: [PushNotificationModule.forFeature()],
  providers: [PushNotificationCustomTemplateAdminService],
  controllers: [PushNotificationCustomTemplateAdminController],
})
export class PushNotificationCustomTemplateAdminModule {}
