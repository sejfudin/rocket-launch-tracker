import { JsonObject } from '~common/types';

export interface IQueueCronJob {
  /**
   * Cron expression (e.g., "0 0 * * *" for daily at midnight)
   */
  cron: string;

  /**
   * Processor name
   */
  processor: string;

  /**
   * Queue name
   */
  queue?: string;

  /**
   * Optional timezone (e.g., "America/New_York")
   */
  timezone?: string;

  /**
   * Optional payload
   */
  payload?: JsonObject;

  /**
   * Optional options
   */
  options?: JsonObject;
}
