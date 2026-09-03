import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

import { QueueJobStatus } from './queue-job.types';

export enum QueueJobPaginationOrderField {
  id = 'id',
  processor = 'processor',
  status = 'status',
  queue = 'queue',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  startedAt = 'startedAt',
  completedAt = 'completedAt',
}

export class QueueJobPaginationFilterDto {
  /**
   * Ids
   */
  @Expose()
  @TransformInputToArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  readonly ids?: string[];

  /**
   * Processor
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly processor?: string;

  /**
   * Queue
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly queue?: string;

  /**
   * Status
   */
  @Expose()
  @IsEnum(QueueJobStatus)
  @ApiProperty({ enum: QueueJobStatus, enumName: 'QueueJobStatus' })
  @IsOptional()
  readonly status?: QueueJobStatus;

  /**
   * Free search data/results
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;
}

export interface IQueueJobPaginationFilter extends QueueJobPaginationFilterDto {}

export class QueueJobPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<QueueJobPaginationFilterDto, QueueJobPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(QueueJobPaginationOrderField)
  readonly order: IPaginationOrder<QueueJobPaginationOrderField>[] = [
    { property: QueueJobPaginationOrderField.updatedAt, direction: 'desc' },
  ];

  @Expose()
  @IsOptional()
  @PaginationFilter(QueueJobPaginationFilterDto)
  readonly filter?: QueueJobPaginationFilterDto;
}

export interface IQueueJobPaginationQuery extends QueueJobPaginationQueryDto {}
