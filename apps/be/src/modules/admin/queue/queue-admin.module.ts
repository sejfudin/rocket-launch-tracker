import { Module } from '@nestjs/common';

import { QueueModule } from '~common/queues';

import { QueueAdminController } from './queue-admin.controller';
import { QueueAdminService } from './queue-admin.service';

@Module({
  imports: [QueueModule.forFeature()],
  controllers: [QueueAdminController],
  providers: [QueueAdminService],
})
export class QueueAdminModule {}
