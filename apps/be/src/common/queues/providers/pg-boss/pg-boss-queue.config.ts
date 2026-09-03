import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import type { QueuePolicy } from 'pg-boss';

import { ConfigDecorator } from '~common/config';
import { TransformInputToBoolean } from '~common/validate';

export class PgBossQueueQueueConfig {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  @IsEnum(['standard', 'short', 'singleton', 'stately'] satisfies QueuePolicy[])
  policy: QueuePolicy = 'standard';

  // todo, add more options

  // deadLetter: string

  // retryLimit
  // retryDelay
  // retryBackoff

  // retentionSeconds
  // retentionMinutes
  // retentionHours
  // retentionDays

  // expireInSeconds
  // expireInMinutes
  // expireInHours
}

export class PgBossQueueWorkerConfig {
  @Expose()
  @IsString()
  queue!: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @TransformInputToBoolean()
  priority = true;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pollingIntervalSeconds: number = 2;

  @Expose()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  batchSize: number = 2;
}

@ConfigDecorator('queues.pg-boss')
export class PgBossQueueConfig {
  /**
   * PostreSQL connection string
   */
  @Expose()
  @IsString()
  @IsOptional()
  url?: string;

  /**
   * Enable SSL
   */
  @Expose()
  @IsBoolean()
  ssl = true;

  /**
   * Database schema the pg-boss tables will be created in
   */
  @Expose()
  @IsString()
  @IsOptional()
  schema: string = 'pgboss';

  /**
   * Listen to scheduled jobs
   */
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  schedule = false;

  /**
   * Maximum number of connections that will be shared by all operations in this instance
   */
  @Expose()
  @IsNumber()
  @IsOptional()
  maxConnections: number = 10;

  /**
   * How often maintenance operations are run against the job and archive tables
   */
  @Expose()
  @IsNumber()
  @IsOptional()
  maintenanceIntervalSeconds?: number;

  /**
   * How long can a shutdown last before hard stopping in milliseconds
   */
  @Expose()
  @IsNumber()
  @IsOptional()
  stopTimeout: number = 30000;

  /**
   * Run migrations on start
   */
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  migrate = true;

  /**
   * Setup queues to the ones configured below
   */
  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  setupQueues = false;

  @Expose()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PgBossQueueQueueConfig)
  queues: PgBossQueueQueueConfig[] = [];

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  runWorkers = false;

  @Expose()
  @IsOptional()
  @Type(() => PgBossQueueWorkerConfig)
  @ValidateNested({ each: true })
  workers: PgBossQueueWorkerConfig[] = [];
}
