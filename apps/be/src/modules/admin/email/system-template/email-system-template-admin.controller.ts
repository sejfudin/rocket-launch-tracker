import { Body, Delete, Get, HttpCode, Param, Put, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { EmailTemplateResponse } from '~common/email/models/email-template.response';
import { EmailTemplateUpdateRequest } from '~common/email/models/email-template-update.request';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';

import { EMAIL_ADMIN_API_TAG } from '../email-admin.constants';
import { EmailSystemTemplateAdminService } from './email-system-template-admin.service';
import { EmailSystemTemplatePaginationQueryDto } from './models/email-system-template.pagination.request';

@AdminController('emails/templates/system', { tags: EMAIL_ADMIN_API_TAG })
export class EmailSystemTemplateAdminController {
  constructor(private readonly emailSystemTemplateService: EmailSystemTemplateAdminService) {}

  @Get()
  @AdminUserAclCheck('email-template:read')
  @ApiPaginationResponse(EmailTemplateResponse)
  async paginate(@Query() query: EmailSystemTemplatePaginationQueryDto): Promise<PaginationDto<EmailTemplateResponse>> {
    const emailTemplates = await this.emailSystemTemplateService.paginate(query);
    return PaginationDto.fromDomain(emailTemplates, EmailTemplateResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('email-template:read')
  async get(@Param('id') name: string): Promise<EmailTemplateResponse> {
    const emailTemplate = await this.emailSystemTemplateService.find({ name });
    return EmailTemplateResponse.fromDomain(emailTemplate);
  }

  @Put(':id')
  @AdminUserAclCheck('email-template:update')
  async update(@Param('id') name: string, @Body() data: EmailTemplateUpdateRequest): Promise<EmailTemplateResponse> {
    const emailTemplate = await this.emailSystemTemplateService.update({ name }, data.toDomain());
    return EmailTemplateResponse.fromDomain(emailTemplate);
  }

  @Delete(':id')
  @AdminUserAclCheck('email-template:delete')
  @ApiResponse({ status: 204, description: 'Email Template deleted' })
  @HttpCode(204)
  async delete(@Param('id') name: string): Promise<void> {
    await this.emailSystemTemplateService.delete({ name });
  }
}
