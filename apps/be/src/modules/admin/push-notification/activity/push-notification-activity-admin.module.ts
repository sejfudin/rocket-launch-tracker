import { Module } from '@nestjs/common';

import { ActivityModule } from '~common/activities';

import { PushNotificationActivityAdminController } from './push-notification-activity-admin.controller';

@Module({
  imports: [ActivityModule],
  controllers: [PushNotificationActivityAdminController],
})
export class PushNotificationActivityAdminModule {}
