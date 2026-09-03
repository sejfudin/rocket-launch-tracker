import { Module } from '@nestjs/common';

import { EmailModule } from '~common/email';

import { EmailCustomTemplateAdminController } from './email-custom-template-admin.controller';
import { EmailCustomTemplateAdminService } from './email-custom-template-admin.service';

@Module({
  imports: [EmailModule.forFeature()],
  providers: [EmailCustomTemplateAdminService],
  controllers: [EmailCustomTemplateAdminController],
})
export class EmailCustomTemplateAdminModule {}
