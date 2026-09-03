import { Body, Get, Post, Query } from '@nestjs/common';

import { EmailService } from '~common/email';
import { StatusResponseDto } from '~common/http/dtos';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelQueryDto, LabelResponse } from '~modules/admin/common/models';
import { EmailSendAdminService } from '~modules/admin/email/send/email-send-admin.service';

import { EMAIL_ADMIN_API_TAG } from '../email-admin.constants';
import { EmailSendAdminRequest } from './models/email-send-admin.request';
import { EmailTemplateSendAdminRequest } from './models/email-template-send-admin.request';

@AdminController('emails', { tags: EMAIL_ADMIN_API_TAG })
export class EmailAdminSendController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailSendService: EmailSendAdminService,
  ) {}

  @Post('send')
  @AdminUserAclCheck('email:send')
  async sendEmail(@Body() data: EmailSendAdminRequest): Promise<StatusResponseDto> {
    await this.emailService.send(data);
    return StatusResponseDto.fromDomain({ code: 'ok', message: 'Email sent successfully' });
  }

  @Get('templates/labels')
  @AdminUserAclCheck('email-template:read')
  async listLabels(@Query() query: LabelQueryDto): Promise<LabelResponse[]> {
    const templates = await this.emailSendService.listLabels(query);
    return templates.map(LabelResponse.fromDomain);
  }

  @Post('templates/send')
  @AdminUserAclCheck('email:send')
  async sendEmailTemplate(@Body() data: EmailTemplateSendAdminRequest): Promise<StatusResponseDto> {
    await this.emailSendService.sendTemplate(data);
    return StatusResponseDto.fromDomain({ code: 'ok', message: 'Email sent successfully' });
  }
}
