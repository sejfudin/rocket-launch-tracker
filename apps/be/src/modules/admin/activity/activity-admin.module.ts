import { Module } from '@nestjs/common';

import { ActivityModule } from '~common/activities';

import { ActivityAdminController } from './activity-admin.controller';

@Module({
  imports: [ActivityModule],
  controllers: [ActivityAdminController],
})
export class ActivityAdminModule {}
