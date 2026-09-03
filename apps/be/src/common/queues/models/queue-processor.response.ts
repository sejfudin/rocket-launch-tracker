import { Expose, Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CronExpressionParser } from 'cron-parser';

import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

import { IQueueCronJob } from './queue-cronjob.types';
import { IQueueProcessor } from './queue-processor.types';

export class QueueCronJobResponse {
  @Expose()
  @IsString()
  cron!: string;

  @Expose()
  @IsOptional()
  @IsString()
  timezone?: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  nextExecution?: string;

  @Expose()
  @IsOptional()
  @IsJsonObject()
  payload?: JsonObject;

  @Expose()
  @IsOptional()
  @IsJsonObject()
  options?: JsonObject;

  constructor(data: QueueCronJobResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IQueueCronJob): QueueCronJobResponse {
    return new QueueCronJobResponse({
      ...data,
      payload: data.payload,
      options: data.options,
      nextExecution: data.cron
        ? CronExpressionParser.parse(data.cron, { tz: data.timezone }).next().toDate().toISOString()
        : undefined,
    });
  }
}

export class QueueProcessorResponse {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  queue!: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  timeout?: number;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => QueueCronJobResponse)
  @IsOptional()
  cronJobs?: Array<QueueCronJobResponse>;

  constructor(data: QueueProcessorResponse) {
    Object.assign(this, data);
  }

  static fromDomain(domain: IQueueProcessor): QueueProcessorResponse {
    return new QueueProcessorResponse({
      ...domain,
      cronJobs: domain.cronJobs?.map((x) => QueueCronJobResponse.fromDomain(x)),
    });
  }
}
