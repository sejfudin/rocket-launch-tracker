import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

import {
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

export class ActivityAdminPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<ActivityPaginationFilterDto, ActivityPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(ActivityPaginationOrderField)
  readonly order?: IPaginationOrder<ActivityPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(ActivityPaginationFilterDto)
  readonly filter?: ActivityPaginationFilterDto;
}
