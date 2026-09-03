import { Expose } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';

import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

import { IQueueJobCreate } from './queue-job.types';

export class QueueJobCreateRequest {
  @Expose()
  @IsString()
  @IsOptional()
  readonly id?: string;

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
  @IsDateString()
  readonly startAfter?: string;

  toDomain(): IQueueJobCreate {
    return {
      id: this.id,
      processor: this.processor,
      payload: this.payload,
      options: {
        ...this.options,
        startAfter: this.startAfter,
      },
    };
  }
}
