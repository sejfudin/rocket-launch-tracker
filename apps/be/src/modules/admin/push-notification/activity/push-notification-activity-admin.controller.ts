import { Get, Param, Query } from '@nestjs/common';

import { ActivityService } from '~common/activities/activity.service';
import { NotFoundException } from '~common/exceptions';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import {
  PUSH_NOTIFICATION_ADMIN_API_TAG,
  PUSH_NOTIFICATION_ADMIN_REST_PREFIX,
} from '~modules/admin/push-notification/push-notification-admin.constants';

import { PushNotificationActivityAdminResponse } from './models/push-notification-activity-admin.response';
import { PushNotificationActivityAdminPaginationQueryDto } from './models/push-notification-activity-admin-pagination.request';

@AdminController(`${PUSH_NOTIFICATION_ADMIN_REST_PREFIX}/activities`, { tags: PUSH_NOTIFICATION_ADMIN_API_TAG })
export class PushNotificationActivityAdminController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @AdminUserAclCheck('activity:read')
  @ApiPaginationResponse(PushNotificationActivityAdminResponse)
  async paginate(
    @Query() query: PushNotificationActivityAdminPaginationQueryDto,
  ): Promise<PaginationDto<PushNotificationActivityAdminResponse>> {
    const { template, event, ...filter } = query.filter ?? {};

    const activity = await this.activityService.paginate({
      ...query,
      filter: {
        ...filter,
        type: 'push-notification',
        payload: Object.fromEntries(
          Object.entries({
            template,
            event,
          }).filter(([, value]) => value !== undefined && value !== ''),
        ) as Record<string, string>,
      },
    });
    return PaginationDto.fromDomain(activity, PushNotificationActivityAdminResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('activity:read')
  async get(@Param('id') id: string): Promise<PushNotificationActivityAdminResponse> {
    const activity = await this.activityService.find({ id });
    if (!activity || activity.module !== 'push-notification') {
      throw new NotFoundException('Activity not found');
    }
    return PushNotificationActivityAdminResponse.fromDomain(activity);
  }
}
