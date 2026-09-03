import { Body, Delete, Get, HttpCode, Param, Put, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import {
  PushNotificationTemplateResponse,
  PushNotificationTemplateUpdateRequest,
} from '~common/push-notifications/models';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';

import {
  PUSH_NOTIFICATION_ADMIN_API_TAG,
  PUSH_NOTIFICATION_ADMIN_REST_PREFIX,
} from '../push-notification-admin.constants';
import { PushNotificationSystemTemplatePaginationQueryDto } from './models';
import { PushNotificationSystemTemplateAdminService } from './push-notification-system-template-admin.service';

@AdminController(`${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}/templates/system`, { tags: PUSH_NOTIFICATION_ADMIN_API_TAG })
export class PushNotificationSystemTemplateAdminController {
  constructor(private readonly pushNotificationSystemTemplateService: PushNotificationSystemTemplateAdminService) {}

  @Get()
  @AdminUserAclCheck('push-notification-template:read')
  @ApiPaginationResponse(PushNotificationTemplateResponse)
  async paginate(
    @Query() query: PushNotificationSystemTemplatePaginationQueryDto,
  ): Promise<PaginationDto<PushNotificationTemplateResponse>> {
    const pushNotificationTemplates = await this.pushNotificationSystemTemplateService.paginate(query);
    return PaginationDto.fromDomain(pushNotificationTemplates, PushNotificationTemplateResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('push-notification-template:read')
  async get(@Param('id') name: string): Promise<PushNotificationTemplateResponse> {
    const pushNotificationTemplate = await this.pushNotificationSystemTemplateService.find({ name });
    return PushNotificationTemplateResponse.fromDomain(pushNotificationTemplate as any);
  }

  @Put(':id')
  @AdminUserAclCheck('push-notification-template:update')
  async update(
    @Param('id') name: string,
    @Body() data: PushNotificationTemplateUpdateRequest,
  ): Promise<PushNotificationTemplateResponse> {
    const pushNotificationTemplate = await this.pushNotificationSystemTemplateService.update({ name }, data.toDomain());
    return PushNotificationTemplateResponse.fromDomain(pushNotificationTemplate as any);
  }

  @Delete(':id')
  @AdminUserAclCheck('push-notification-template:delete')
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @HttpCode(204)
  async delete(@Param('id') name: string): Promise<void> {
    await this.pushNotificationSystemTemplateService.delete({ name });
  }
}
