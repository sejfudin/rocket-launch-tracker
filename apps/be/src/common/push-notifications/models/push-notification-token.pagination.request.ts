import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import { IPaginationOrder, PaginationFilter, PaginationOrder, PaginationQueryDto } from '~common/http/pagination';

export enum PushNotificationTokenOrderField {
  id = 'id',
  provider = 'provider',
  expiresAt = 'expiresAt',
  createdAt = 'createdAt',
}

export class PushNotificationTokenFiltersDto {
  /**
   * Provider
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly provider?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  /**
   * Creation date range filter
   */
  @Expose()
  @Type(() => DateRangeDto)
  @IsOptional()
  @ApiPropertyOptional({ type: DateRangeDto })
  @ValidateNested()
  readonly createdAt?: DateRangeDto;
}

export interface IPushNotificationTokenFilter extends PushNotificationTokenFiltersDto {}

export class PushNotificationTokenPaginationQueryDto extends PaginationQueryDto {
  /**
   * Order by
   */
  @Expose()
  @IsOptional()
  @PaginationOrder(PushNotificationTokenOrderField)
  readonly order?: IPaginationOrder<PushNotificationTokenOrderField>[];

  /**
   * Filter
   */
  @Expose()
  @IsOptional()
  @PaginationFilter(PushNotificationTokenFiltersDto)
  readonly filter?: PushNotificationTokenFiltersDto;
}

export interface IPushNotificationTokenPaginationQuery extends PushNotificationTokenPaginationQueryDto {}
