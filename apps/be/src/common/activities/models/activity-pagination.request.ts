import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import type { IDateRange } from '~common/http/interfaces/date-range.interface';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

export enum ActivityPaginationOrderField {
  timestamp = 'timestamp',
}

export interface IActivityPaginationFilter {
  ids?: string[];

  timestamp?: IDateRange;

  module?: string;
  type?: string;
  userId?: string;
  resourceId?: string;

  search?: string;
  payload?: Record<string, string>;
}

export interface IActivityPaginationQuery
  extends IPaginationQuery<IActivityPaginationFilter, ActivityPaginationOrderField> {}

export class ActivityPaginationBaseFilterDto implements IActivityPaginationFilter {
  @Expose()
  @TransformInputToArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  readonly ids?: string[];

  @Expose()
  @Type(() => DateRangeDto)
  @IsOptional()
  @ValidateNested()
  readonly timestamp?: DateRangeDto;

  @Expose()
  @IsString()
  @IsOptional()
  readonly type?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly userId?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly resourceId?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;
}

export class ActivityPaginationFilterDto extends ActivityPaginationBaseFilterDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;
}

export interface IActivityPaginationFilterDto extends ActivityPaginationFilterDto {}

export class ActivityPaginationQueryDto
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

export interface IActivityPaginationQueryDto extends ActivityPaginationQueryDto {}
