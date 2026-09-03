import { Module } from '@nestjs/common';

import { EmailModule } from '~common/email';

import { EmailSystemTemplateAdminController } from './email-system-template-admin.controller';
import { EmailSystemTemplateAdminService } from './email-system-template-admin.service';

@Module({
  imports: [EmailModule.forFeature()],
  providers: [EmailSystemTemplateAdminService],
  controllers: [EmailSystemTemplateAdminController],
})
export class EmailSystemTemplateAdminModule {}
