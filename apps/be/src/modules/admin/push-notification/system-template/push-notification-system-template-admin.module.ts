import { Module } from '@nestjs/common';

import { PushNotificationModule } from '~common/push-notifications';

import { PushNotificationSystemTemplateAdminController } from './push-notification-system-template-admin.controller';
import { PushNotificationSystemTemplateAdminService } from './push-notification-system-template-admin.service';

@Module({
  imports: [PushNotificationModule.forFeature()],
  providers: [PushNotificationSystemTemplateAdminService],
  controllers: [PushNotificationSystemTemplateAdminController],
})
export class PushNotificationSystemTemplateAdminModule {}
