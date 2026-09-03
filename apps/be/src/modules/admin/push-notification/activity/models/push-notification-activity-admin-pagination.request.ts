import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  ActivityPaginationBaseFilterDto,
  ActivityPaginationFilterDto,
  ActivityPaginationOrderField,
} from '~common/activities/models/activity-pagination.request';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { PushNotificationLogEvent } from '~common/push-notifications/models/push-notification-log.types';

class PushNotificationActivityPaginationFilterDto extends ActivityPaginationBaseFilterDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly template?: string;

  @Expose()
  @IsEnum(PushNotificationLogEvent)
  @IsOptional()
  @ApiPropertyOptional({ enum: PushNotificationLogEvent, enumName: 'PushNotificationLogEvent' })
  readonly event?: PushNotificationLogEvent;
}

export class PushNotificationActivityAdminPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<ActivityPaginationFilterDto, ActivityPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(ActivityPaginationOrderField)
  readonly order?: IPaginationOrder<ActivityPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(PushNotificationActivityPaginationFilterDto)
  readonly filter?: PushNotificationActivityPaginationFilterDto;
}
