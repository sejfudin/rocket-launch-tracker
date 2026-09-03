import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import { IPaginationOrder, PaginationFilter, PaginationOrder, PaginationQueryDto } from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

import {
  AdminUserPaginationOrderField,
  IAdminUserPaginationFilter,
  IAdminUserPaginationQuery,
} from '../models/admin-user.types';

class AdminUserPaginationFilterDto implements IAdminUserPaginationFilter {
  /**
   * Ids
   */
  @Expose()
  @TransformInputToArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  readonly ids?: string[];

  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * Model
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly model?: string;

  /**
   * Free search
   */
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

export class AdminUserPaginationQueryDto extends PaginationQueryDto implements IAdminUserPaginationQuery {
  @Expose()
  @IsOptional()
  @PaginationOrder(AdminUserPaginationOrderField)
  readonly order?: IPaginationOrder<AdminUserPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(AdminUserPaginationFilterDto)
  readonly filter?: AdminUserPaginationFilterDto;
}
