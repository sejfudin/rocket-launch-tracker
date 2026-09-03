import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

export enum QueueProcessorPaginationOrderField {
  name = 'name',
  queue = 'queue',
}

export class QueueProcessorPaginationFilterDto {
  /**
   * Names
   */
  @Expose()
  @TransformInputToArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  readonly names?: string[];

  /**
   * Queue
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly queue?: string;
}

export interface IQueueProcessorPaginationFilter extends QueueProcessorPaginationFilterDto {}

export class QueueProcessorPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<QueueProcessorPaginationFilterDto, QueueProcessorPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(QueueProcessorPaginationOrderField)
  readonly order?: IPaginationOrder<QueueProcessorPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(QueueProcessorPaginationFilterDto)
  readonly filter?: QueueProcessorPaginationFilterDto;
}

export interface IQueueProcessorPaginationQuery extends QueueProcessorPaginationQueryDto {}
