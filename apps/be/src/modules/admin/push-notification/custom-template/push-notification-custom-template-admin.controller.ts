import { Body, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import {
  PushNotificationTemplateCreateRequest,
  PushNotificationTemplatePaginationQueryDto,
  PushNotificationTemplateResponse,
  PushNotificationTemplateType,
  PushNotificationTemplateUpdateRequest,
} from '~common/push-notifications/models';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelQueryDto, LabelResponse } from '~modules/admin/common/models';

import {
  PUSH_NOTIFICATION_ADMIN_API_TAG,
  PUSH_NOTIFICATION_ADMIN_REST_PREFIX,
} from '../push-notification-admin.constants';
import { PushNotificationCustomTemplateAdminService } from './push-notification-custom-template-admin.service';

@AdminController(`${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}/templates/custom`, { tags: PUSH_NOTIFICATION_ADMIN_API_TAG })
export class PushNotificationCustomTemplateAdminController {
  constructor(
    private readonly pushNotificationCustomTemplateAdminService: PushNotificationCustomTemplateAdminService,
  ) {}

  @Get()
  @AdminUserAclCheck('push-notification-template:read')
  @ApiPaginationResponse(PushNotificationTemplateResponse)
  async paginate(
    @Query() query: PushNotificationTemplatePaginationQueryDto,
  ): Promise<PaginationDto<PushNotificationTemplateResponse>> {
    const pushNotificationTemplates = await this.pushNotificationCustomTemplateAdminService.paginate(query);
    return PaginationDto.fromDomain(pushNotificationTemplates, PushNotificationTemplateResponse.fromDomain);
  }

  @Get('labels')
  @AdminUserAclCheck('push-notification-template:read')
  async listLabels(@Query() query: LabelQueryDto): Promise<LabelResponse[]> {
    const templates = await this.pushNotificationCustomTemplateAdminService.listLabels(query);
    return templates.map(LabelResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('push-notification-template:read')
  async get(@Param('id') name: string): Promise<PushNotificationTemplateResponse> {
    const pushNotificationTemplate = await this.pushNotificationCustomTemplateAdminService.find({ name });
    return PushNotificationTemplateResponse.fromDomain(pushNotificationTemplate as any);
  }

  @Post()
  @AdminUserAclCheck('push-notification-template:create')
  async create(@Body() data: PushNotificationTemplateCreateRequest): Promise<PushNotificationTemplateResponse> {
    const pushNotificationTemplate = await this.pushNotificationCustomTemplateAdminService.create(
      data.toDomain(PushNotificationTemplateType.CUSTOM),
    );
    return PushNotificationTemplateResponse.fromDomain(pushNotificationTemplate as any);
  }

  @Put(':id')
  @AdminUserAclCheck('push-notification-template:update')
  async update(
    @Param('id') name: string,
    @Body() data: PushNotificationTemplateUpdateRequest,
  ): Promise<PushNotificationTemplateResponse> {
    const pushNotificationTemplate = await this.pushNotificationCustomTemplateAdminService.update(
      { name },
      data.toDomain(),
    );
    return PushNotificationTemplateResponse.fromDomain(pushNotificationTemplate as any);
  }

  @Delete(':id')
  @AdminUserAclCheck('push-notification-template:delete')
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @HttpCode(204)
  async delete(@Param('id') name: string): Promise<void> {
    await this.pushNotificationCustomTemplateAdminService.delete({ name });
  }
}
