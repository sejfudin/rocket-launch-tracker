import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import { IPaginationOrder, PaginationFilter, PaginationOrder, PaginationQueryDto } from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

export enum UserPaginationOrderField {
  name = 'name',
  email = 'email',
  createdAt = 'createdAt',
}

class UserPaginationFilterDto implements IUserPaginationFilter {
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
   * Email
   */
  @Expose()
  @IsEmail()
  @IsOptional()
  readonly email?: string;

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

export interface IUserPaginationFilter extends UserPaginationFilterDto {}

export class UserPaginationQueryDto extends PaginationQueryDto implements IUserPaginationQuery {
  @Expose()
  @IsOptional()
  @PaginationOrder(UserPaginationOrderField)
  readonly order?: IPaginationOrder<UserPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(UserPaginationFilterDto)
  readonly filter?: UserPaginationFilterDto;
}

export interface IUserPaginationQuery extends UserPaginationQueryDto {}
