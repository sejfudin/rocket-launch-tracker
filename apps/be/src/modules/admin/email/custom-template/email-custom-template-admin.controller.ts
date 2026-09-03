import { Body, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { EmailTemplateType } from '~common/email/models';
import { EmailTemplateResponse } from '~common/email/models/email-template.response';
import { EmailTemplateCreateRequest } from '~common/email/models/email-template-create.request';
import { EmailTemplateUpdateRequest } from '~common/email/models/email-template-update.request';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelQueryDto, LabelResponse } from '~modules/admin/common/models';
import { EmailCustomTemplatePaginationQueryDto } from '~modules/admin/email/custom-template/models';

import { EMAIL_ADMIN_API_TAG } from '../email-admin.constants';
import { EmailCustomTemplateAdminService } from './email-custom-template-admin.service';

@AdminController('emails/templates/custom', { tags: EMAIL_ADMIN_API_TAG })
export class EmailCustomTemplateAdminController {
  constructor(private readonly emailCustomTemplateAdminService: EmailCustomTemplateAdminService) {}

  @Get()
  @AdminUserAclCheck('email-template:read')
  @ApiPaginationResponse(EmailTemplateResponse)
  async paginate(@Query() query: EmailCustomTemplatePaginationQueryDto): Promise<PaginationDto<EmailTemplateResponse>> {
    const emailTemplates = await this.emailCustomTemplateAdminService.paginate(query);
    return PaginationDto.fromDomain(emailTemplates, EmailTemplateResponse.fromDomain);
  }

  @Get('labels')
  @AdminUserAclCheck('email-template:read')
  async listLabels(@Query() query: LabelQueryDto): Promise<LabelResponse[]> {
    const templates = await this.emailCustomTemplateAdminService.listLabels(query);
    return templates.map(LabelResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('email-template:read')
  async get(@Param('id') name: string): Promise<EmailTemplateResponse> {
    const emailTemplate = await this.emailCustomTemplateAdminService.find({ name });
    return EmailTemplateResponse.fromDomain(emailTemplate);
  }

  @Post()
  @AdminUserAclCheck('email-template:create')
  async create(@Body() data: EmailTemplateCreateRequest): Promise<EmailTemplateResponse> {
    const emailTemplate = await this.emailCustomTemplateAdminService.create(data.toDomain(EmailTemplateType.CUSTOM));
    return EmailTemplateResponse.fromDomain(emailTemplate);
  }

  @Put(':id')
  @AdminUserAclCheck('email-template:update')
  async update(@Param('id') name: string, @Body() data: EmailTemplateUpdateRequest): Promise<EmailTemplateResponse> {
    const emailTemplate = await this.emailCustomTemplateAdminService.update({ name }, data.toDomain());
    return EmailTemplateResponse.fromDomain(emailTemplate);
  }

  @Delete(':id')
  @AdminUserAclCheck('email-template:delete')
  @ApiResponse({ status: 204, description: 'Email Template deleted' })
  @HttpCode(204)
  async delete(@Param('id') name: string): Promise<void> {
    await this.emailCustomTemplateAdminService.delete({ name });
  }
}
