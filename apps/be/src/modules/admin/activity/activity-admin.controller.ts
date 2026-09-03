import { Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ActivityService } from '~common/activities/activity.service';
import { ActivityResponse } from '~common/activities/models/activity.response';
import { ActivityAggregationResponse } from '~common/activities/models/activity-aggregation.response';
import { NotFoundException } from '~common/exceptions';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';

import { ACTIVITY_ADMIN_API_TAG, ACTIVITY_ADMIN_REST_PREFIX } from './activity-admin.constants';
import { ActivityAdminAggregationQueryDto } from './models/activity-admin-aggregation.request';
import { ActivityAdminPaginationQueryDto } from './models/activity-admin-pagination.request';

@ApiTags(`${ACTIVITY_ADMIN_API_TAG} Admin`)
@AdminController(ACTIVITY_ADMIN_REST_PREFIX)
export class ActivityAdminController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @AdminUserAclCheck('activity:read')
  @ApiPaginationResponse(ActivityResponse)
  async paginate(@Query() query: ActivityAdminPaginationQueryDto): Promise<PaginationDto<ActivityResponse>> {
    const activity = await this.activityService.paginate(query);
    return PaginationDto.fromDomain(activity, ActivityResponse.fromDomain);
  }

  @Get('aggregations')
  @AdminUserAclCheck('activity:read')
  async aggregations(@Query() query: ActivityAdminAggregationQueryDto): Promise<ActivityAggregationResponse[]> {
    const aggregations = await this.activityService.aggregate(query);
    return aggregations.map(ActivityAggregationResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('activity:read')
  async get(@Param('id') id: string): Promise<ActivityResponse> {
    const activity = await this.activityService.find({ id });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return ActivityResponse.fromDomain(activity);
  }
}
