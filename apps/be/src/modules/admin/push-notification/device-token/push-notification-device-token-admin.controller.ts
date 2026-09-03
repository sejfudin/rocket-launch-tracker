import { Delete, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import { PushNotificationTokenService } from '~common/push-notifications';
import {
  PushNotificationLabelsRequest,
  PushNotificationTokenPaginationQueryDto,
} from '~common/push-notifications/models';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelResponse } from '~modules/admin/common/models/label.response';

import {
  PUSH_NOTIFICATION_ADMIN_API_TAG,
  PUSH_NOTIFICATION_ADMIN_REST_PREFIX,
} from '../push-notification-admin.constants';
import { PushNotificationDeviceTokenAdminResponse } from './models/push-notification-device-token-admin.response';
import { PushNotificationDeviceTokenAdminService } from './push-notification-device-token-admin.service';

@AdminController(`${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}/device-tokens`, { tags: PUSH_NOTIFICATION_ADMIN_API_TAG })
export class PushNotificationDeviceTokenAdminController {
  constructor(
    private readonly pushNotificationDeviceTokenAdminService: PushNotificationDeviceTokenAdminService,
    private readonly pushNotificationTokenService: PushNotificationTokenService,
  ) {}

  @Get()
  @AdminUserAclCheck('push-notification-device:read')
  @ApiOperation({ summary: 'List paginated push notification device tokens' })
  @ApiPaginationResponse(PushNotificationDeviceTokenAdminResponse)
  async paginate(
    @Query() query: PushNotificationTokenPaginationQueryDto,
  ): Promise<PaginationDto<PushNotificationDeviceTokenAdminResponse>> {
    return await this.pushNotificationDeviceTokenAdminService.paginate(query);
  }

  @Delete(':id')
  @AdminUserAclCheck('push-notification-device:delete')
  @ApiResponse({ status: 204, description: 'Device token deleted successfully' })
  @HttpCode(204)
  async delete(@Param('id') deviceTokenId: string) {
    await this.pushNotificationDeviceTokenAdminService.delete(deviceTokenId);
  }

  @Get('labels')
  @AdminUserAclCheck('push-notification-device:read')
  async listLabels(@Query() query: PushNotificationLabelsRequest): Promise<LabelResponse[]> {
    const labels = await this.pushNotificationTokenService.listLabels(query);
    return labels.map(LabelResponse.fromDomain);
  }
}
