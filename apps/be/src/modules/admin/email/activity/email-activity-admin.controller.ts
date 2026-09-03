import { Get, Param, Query } from '@nestjs/common';

import { ActivityService } from '~common/activities/activity.service';
import { NotFoundException } from '~common/exceptions';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { EMAIL_ADMIN_API_TAG, EMAIL_ADMIN_REST_PREFIX } from '~modules/admin/email/email-admin.constants';

import { EmailActivityAdminResponse } from './models/email-activity-admin.response';
import { EmailActivityAdminPaginationQueryDto } from './models/email-activity-admin-pagination.request';

@AdminController(`${EMAIL_ADMIN_REST_PREFIX}/activities`, { tags: EMAIL_ADMIN_API_TAG })
export class EmailActivityAdminController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @AdminUserAclCheck('activity:read')
  @ApiPaginationResponse(EmailActivityAdminResponse)
  async paginate(
    @Query() query: EmailActivityAdminPaginationQueryDto,
  ): Promise<PaginationDto<EmailActivityAdminResponse>> {
    const { provider, templateName, event, ...filter } = query.filter ?? {};
    const activity = await this.activityService.paginate({
      ...query,
      filter: {
        ...filter,
        type: 'email',
        payload: Object.fromEntries(
          Object.entries({
            provider,
            templateName,
            event,
          }).filter(([, value]) => value !== undefined && value !== ''),
        ) as Record<string, string>,
      },
    });
    return PaginationDto.fromDomain(activity, EmailActivityAdminResponse.fromDomain);
  }

  @Get(':id')
  @AdminUserAclCheck('activity:read')
  async get(@Param('id') id: string): Promise<EmailActivityAdminResponse> {
    const activity = await this.activityService.find({ id });
    if (!activity || activity.module !== 'email') {
      throw new NotFoundException('Activity not found');
    }
    return EmailActivityAdminResponse.fromDomain(activity);
  }
}
