import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

import { RocketStatusType } from '~modules/rocket/models/rocket.types';

export enum RocketPaginationOrderField {
  id = 'id',
  name = 'name',
  model = 'model',
  createdAt = 'createdAt',
}

export class RocketPaginationFilterDto {
  /**
   * Owner ID
   */
  @Expose()
  @IsUUID()
  @IsOptional()
  readonly ownerId?: string;

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
   * Stage
   */
  @Expose()
  @IsEnum(RocketStatusType)
  @ApiProperty({ enum: RocketStatusType, enumName: 'RocketStatusType' })
  @IsOptional()
  readonly status?: RocketStatusType;

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

export interface IRocketPaginationFilter extends RocketPaginationFilterDto {}

export class RocketPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<RocketPaginationFilterDto, RocketPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(RocketPaginationOrderField)
  readonly order?: IPaginationOrder<RocketPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(RocketPaginationFilterDto)
  readonly filter?: RocketPaginationFilterDto;
}

export interface IRocketPaginationQuery extends RocketPaginationQueryDto {}
