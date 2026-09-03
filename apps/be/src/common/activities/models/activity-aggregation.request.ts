import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import type { IDateRange } from '~common/http/interfaces/date-range.interface';

export enum ActivityAggregationTimeBucket {
  minute = 'minute',
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
}

export interface IActivityAggregationQuery {
  timeBucket: ActivityAggregationTimeBucket;
  timestamp?: IDateRange;

  module?: string;
  type?: string;
  userId?: string;
  resourceId?: string;
}

export interface IActivityAggregation {
  bucket: Date;
  count: number;
}

export class ActivityAggregationQueryDto implements IActivityAggregationQuery {
  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly type?: string;

  @Expose()
  @IsEnum(ActivityAggregationTimeBucket)
  @ApiProperty({
    enum: ActivityAggregationTimeBucket,
    enumName: 'ActivityAggregationTimeBucket',
  })
  readonly timeBucket!: ActivityAggregationTimeBucket;

  @Expose()
  @Type(() => DateRangeDto)
  @IsOptional()
  @ValidateNested()
  readonly timestamp?: DateRangeDto;
}

export interface IActivityAggregationQueryDto extends ActivityAggregationQueryDto {}
