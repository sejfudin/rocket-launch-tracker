import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';

export enum RocketModelPaginationOrderField {
  id = 'id',
  name = 'name',
  createdAt = 'createdAt',
}

export class RocketModelPaginationFilterDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;
}

export interface IRocketModelPaginationFilter extends RocketModelPaginationFilterDto {}

export class RocketModelPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<RocketModelPaginationFilterDto, RocketModelPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(RocketModelPaginationOrderField)
  readonly order?: IPaginationOrder<RocketModelPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(RocketModelPaginationFilterDto)
  readonly filter?: RocketModelPaginationFilterDto;
}

export interface IRocketModelPaginationQuery extends RocketModelPaginationQueryDto {}
