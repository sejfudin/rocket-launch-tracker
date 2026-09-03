import { Module } from '@nestjs/common';

import { ActivityModule } from '~common/activities';

import { EmailActivityAdminController } from './email-activity-admin.controller';

@Module({
  imports: [ActivityModule],
  controllers: [EmailActivityAdminController],
})
export class EmailActivityAdminModule {}
