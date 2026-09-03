import { ClassConstructor } from 'class-transformer';

import { IQueueCronJob } from './queue-cronjob.types';

/**
 * Processor settings
 */
export interface IQueueProcessor {
  /**
   * Processor Name
   */
  name: string;

  /**
   * Processors in the same queue will:
   *  - default to settings of the queue
   *  - be processed in sequence if the queue is FIFO
   *  - share the same concurrency per executor
   */
  queue: string;

  // type of class-validator object to validate input
  validate?: ClassConstructor<object>;

  /**
   * Default timeout for the processor
   */
  timeout?: number;

  /**
   * Default retry limit for the processor
   */
  retryLimit?: number;

  /**
   * List of cron jobs for this processor
   *  - see provider for specifics
   */
  cronJobs?: IQueueCronJob[];
}
