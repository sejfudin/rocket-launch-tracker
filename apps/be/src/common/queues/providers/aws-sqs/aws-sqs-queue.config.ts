import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, ValidateIf, ValidateNested } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { TransformInputToBoolean } from '~common/validate';

export class AwsSqsQueueWorkerConfig {
  @Expose()
  @IsString()
  queue!: string;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxNumberOfMessages: number = 1;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  waitTimeSeconds: number = 20;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  visibilityTimeoutSeconds?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  messageRetentionPeriodSeconds?: number;
}

@ConfigDecorator('queues.aws-sqs')
export class AwsSqsQueueConfig {
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  enabled = true;

  /**
   * AWS region
   */
  @Expose()
  @IsString()
  @ValidateIf((o: AwsSqsQueueConfig) => o.enabled)
  region!: string;

  /**
   * AWS access key ID
   */
  @Expose()
  @IsString()
  @IsOptional()
  accessKeyId?: string;

  /**
   * AWS secret access key
   */
  @Expose()
  @IsString()
  @IsOptional()
  secretAccessKey?: string;

  /**
   * SQS endpoint URL (for local testing with LocalStack)
   */
  @Expose()
  @IsString()
  @IsOptional()
  endpoint?: string;

  /**
   * AWS account ID (required if queueUrlPrefix is not provided and using AWS)
   */
  @Expose()
  @IsString()
  @IsOptional()
  accountId?: string;

  /**
   * Queue URL prefix (optional, will be constructed from region, endpoint, and accountId if not provided)
   */
  @Expose()
  @IsString()
  @IsOptional()
  queueUrlPrefix?: string;

  /**
   * Run workers to listen to SQS queues
   */
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  runWorkers = false;

  @Expose()
  @IsOptional()
  @Type(() => AwsSqsQueueWorkerConfig)
  @ValidateNested({ each: true })
  workers: AwsSqsQueueWorkerConfig[] = [];

  /**
   * Get the queue URL prefix, constructing it from other config options if not explicitly provided
   */
  getQueueUrlPrefix(): string {
    return this.queueUrlPrefix ?? `https://sqs.${this.region}.amazonaws.com/${this.accountId}`;
  }
}
