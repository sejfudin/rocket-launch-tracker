import { Injectable } from '@nestjs/common';

import { JsonObject } from '~common/types';

import { IQueueJob, QueueJobStatus } from './models';
import { QueueError } from './queue.exceptions';
import { QueueLoader } from './queue.loader';

@Injectable()
export class QueueExecutorService {
  constructor(private readonly loader: QueueLoader) {}

  /**
   * Execute local job
   *  - called by QueueProviderEvent
   */
  public async execute<T = JsonObject>(job: IQueueJob<T>): Promise<IQueueJob<T>> {
    if (!(job.processor in this.loader.processors)) {
      /**
       * Several reasons for this
       *  - processor not loaded by provider preprocessor ( on this type of instance )
       *  - processor was removed from code after job was enqueued
       */
      throw new Error(`Processor '${job.processor}' not found`);
    }

    const { processorFunction } = this.loader.processors[job.processor];

    job.status = QueueJobStatus.RUNNING;

    const startedAt = Date.now();

    this.loader.log({
      level: 'debug',
      event: 'execute',
      job,
    });

    try {
      job.result = await processorFunction(job as IQueueJob<JsonObject>);
      job.status = QueueJobStatus.COMPLETED;

      this.loader.log({
        event: 'completed',
        level: 'log',
        duration: Date.now() - startedAt,
      });
      return job;
    } catch (e) {
      const error =
        e instanceof QueueError
          ? e
          : new QueueError(e instanceof Error ? e.message : 'Job execution failed', { job, cause: e });
      this.loader.log({
        event: 'execute',
        level: 'error',
        duration: Date.now() - startedAt,
        error,
      });
      throw error;
    }
  }
}
