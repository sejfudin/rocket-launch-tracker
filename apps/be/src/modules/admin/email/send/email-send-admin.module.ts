import { Module } from '@nestjs/common';

import { EmailModule } from '~common/email';

import { EmailAdminSendController } from './email-send-admin.controller';
import { EmailSendAdminService } from './email-send-admin.service';

@Module({
  imports: [EmailModule.forFeature()],
  controllers: [EmailAdminSendController],
  providers: [EmailSendAdminService],
})
export class EmailAdminSendModule {}
