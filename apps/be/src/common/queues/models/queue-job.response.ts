import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

import { IQueueJob, QueueJobStatus } from './queue-job.types';

export class QueueJobResponse {
  @Expose()
  @IsString()
  id!: string;

  @Expose()
  @IsString()
  processor!: string;

  @Expose()
  @IsOptional()
  @IsJsonObject()
  payload?: JsonObject;

  @Expose()
  @IsOptional()
  @IsJsonObject()
  options?: JsonObject;

  @Expose()
  @IsOptional()
  @IsEnum(QueueJobStatus)
  @ApiProperty({ enum: QueueJobStatus, enumName: 'QueueJobStatus' })
  status?: QueueJobStatus;

  @Expose()
  @IsOptional()
  @IsJsonObject()
  result?: JsonObject;

  @Expose()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  startAfter?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  startedAt?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  doneAt?: Date;

  constructor(data: QueueJobResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IQueueJob): QueueJobResponse {
    return new QueueJobResponse({
      ...data,
      payload: data.payload,
      options: data.options as JsonObject | undefined,
      result: data.result,
    });
  }
}
