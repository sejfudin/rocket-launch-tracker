import { Injectable } from '@nestjs/common';

import { JsonObject } from '~common/types';
import { plainToValidatedInstance } from '~common/validate';

import { IQueueJob, IQueueJobCreate, IQueueJobOptions } from './models';
import { QueueError } from './queue.exceptions';
import { QueueLoader } from './queue.loader';
import { QueueProvider } from './queue-provider.abstract';

@Injectable()
export class QueueService {
  constructor(
    private readonly loader: QueueLoader,
    private readonly queueProvider: QueueProvider,
  ) {}

  /**
   * Enqueue a job
   *  the job will be processed asynchronously in a worker that might be
   *  running in a different process or server. Input and output should
   *  be short and JSON serializable.
   *
   * @param processorName - processor name
   * @param data - job data
   * @param options - execution options
   */
  public async enqueue<Payload = JsonObject>(
    processorName: string,
    data: Payload,
    options?: IQueueJobOptions,
  ): Promise<IQueueJob<Payload>> {
    if (!this.loader.processors[processorName]) {
      throw new Error(`Processor '${processorName}' not found`);
    }

    const { processorSettings } = this.loader.processors[processorName];

    let newJob = {
      processor: processorName,
      options: {
        timeout: processorSettings.timeout,
        retryLimit: processorSettings.retryLimit,
        ...options,
      },
      payload: processorSettings?.validate
        ? (plainToValidatedInstance(processorSettings.validate, data) as Payload)
        : data,
    } as IQueueJobCreate<Payload>;

    try {
      const job = await this.queueProvider.enqueue(newJob as IQueueJobCreate<JsonObject>);
      await this.loader.log({ level: 'log', event: 'enqueue', job });
      return job as IQueueJob<Payload>;
    } catch (e) {
      const error =
        e instanceof QueueError
          ? e
          : new QueueError(`Processor '${newJob.processor}' job registration failed`, {
              job: newJob,
              cause: e,
            });
      await this.loader.log({ level: 'error', event: 'enqueue', error });
      throw error;
    }
  }
}
