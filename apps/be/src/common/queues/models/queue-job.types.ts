import type { JsonObject, JsonUObject } from '~common/types';

export enum QueueJobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry',
  CANCELLED = 'cancelled',
}

/**
 * Job options
 */
export interface IQueueJobOptions extends JsonUObject {
  /**
   * Job timeout in milliseconds
   */
  timeout?: number;

  /**
   * Override jobId
   *  - see provider for specifics
   */
  id?: string | number;

  /**
   * Start after a certain date
   *  - ISO timestamp string
   *  - if not provided, the job will be processed immediately
   */
  startAfter?: string;

  /**
   * Retry limit
   */
  retryLimit?: number;
}

/**
 * Job instance
 */
export interface IQueueJob<Payload = JsonObject, Result = JsonObject> {
  /**
   * Internal job id
   */
  id: string;

  /**
   * Processor name
   */
  processor: string;

  /**
   * Queue name
   */
  queue?: string;

  /**
   * Options needed for job management
   */
  options?: IQueueJobOptions;

  /**
   * Payload of the job
   */
  payload?: Payload;

  /**
   * Job status
   */
  status?: QueueJobStatus;

  /**
   * Result of the job
   */
  result?: Result;

  createdAt?: Date;
  updatedAt?: Date;
  startAfter?: Date;
  startedAt?: Date;
  doneAt?: Date;
}

export interface IQueueJobCreate<Payload = JsonObject> {
  id?: string;
  processor: string;
  queue?: string;
  payload?: Payload;
  options?: IQueueJobOptions;
}

export interface IQueueJobUpdate<Result = JsonObject> {
  status: QueueJobStatus;
  result?: Result;
  doneAt?: Date;
}
