import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
  SendMessageCommand,
  type SendMessageCommandInput,
} from '@aws-sdk/client-sqs';
import {
  HttpStatus,
  Injectable,
  type ModuleMetadata,
  type OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { IPagination } from '~common/http/pagination';
import { LoggerService } from '~common/logger';
import { QueueError } from '~common/queues/queue.exceptions';
import { ISettingsSection, SettingsPopulate, SettingsSettingAction, SettingsStatus } from '~common/settings';
import { JsonObject } from '~common/types';
import { makeId } from '~common/utils/short-uuid';

import { IQueueJob, IQueueJobCreate, IQueueJobPaginationQuery, QueueJobStatus } from '../../models';
import { QueueExecutorService } from '../../queue.executor';
import { QueueLoader } from '../../queue.loader';
import { QueuePersistor } from '../../queue-persistor.abstract';
import { QueueProvider } from '../../queue-provider.abstract';
import { AwsSqsQueueConfig, AwsSqsQueueWorkerConfig } from './aws-sqs-queue.config';

@Injectable()
export class AwsSqsQueueProvider implements QueueProvider, OnApplicationShutdown, OnApplicationBootstrap {
  private sqsClient?: SQSClient;
  private isShuttingDown = false;
  private workerBackoffErrors: Map<string, number> = new Map();

  constructor(
    private readonly logger: LoggerService,
    private readonly awsSqsQueueConfig: AwsSqsQueueConfig,
    private readonly queueExecutor: QueueExecutorService,
    private readonly queueLoader: QueueLoader,
    private readonly queuePersistor: QueuePersistor,
  ) {}

  public async enqueue<T = JsonObject>(job: IQueueJobCreate<T>): Promise<IQueueJob<T>> {
    if (!this.sqsClient) {
      throw new Error(`SQS client not initialized`);
    }

    const startAfter = job.options?.startAfter ? new Date(job.options.startAfter) : undefined;
    let delaySeconds = 0;
    if (startAfter) {
      delaySeconds = Math.min(Math.floor((startAfter.getTime() - Date.now()) / 1000), 900);
      if (delaySeconds > 15) {
        throw new QueueError(`Max start after delay is 15 minutes`, { job, httpStatus: HttpStatus.BAD_REQUEST });
      }
    }

    const jobId = job.id || makeId();

    const processor = this.queueLoader.processors[job.processor];
    if (!processor) {
      throw new Error(`Processor '${job.processor}' not found`);
    }

    const { processorSettings } = processor;
    const queueName = processorSettings.queue || 'default';

    // Store job in persistor first
    const createdJob = await this.queuePersistor.transaction(async (tx) => {
      const existingJob = await this.queuePersistor.find({ id: jobId }, tx);
      if (existingJob?.status === QueueJobStatus.RUNNING) {
        throw new Error(`Job is already running (status: ${existingJob.status})`);
      }

      return await this.queuePersistor.create(
        {
          ...job,
          id: jobId,
          status: QueueJobStatus.QUEUED,
          startAfter,
        } as IQueueJob<JsonObject>,
        tx,
      );
    });

    try {
      const messageBody: SendMessageCommandInput = {
        QueueUrl: `${this.awsSqsQueueConfig.getQueueUrlPrefix()}/${queueName}`,
        MessageBody: JSON.stringify({
          id: jobId,
        }),
      };

      if (startAfter) {
        messageBody.DelaySeconds = Math.min(Math.floor((startAfter.getTime() - Date.now()) / 1000), 900);
      }

      await this.sqsClient.send(new SendMessageCommand(messageBody));
      this.logger.debug(`Enqueued job ${jobId} to SQS queue ${queueName}`);
    } catch (error) {
      this.logger.error(`Failed to send job ${jobId} to SQS`, error);
      // Update job status to failed if SQS send fails
      await this.queuePersistor.update(jobId, {
        status: QueueJobStatus.FAILED,
        error: error instanceof Error ? error.message : 'Failed to send to SQS',
      });
      throw error;
    }

    return createdJob as IQueueJob<T>;
  }

  public async cancel(where: { id: string }): Promise<IQueueJob> {
    const cancelledJob = await this.queuePersistor.cancel(where);

    if (!cancelledJob) {
      throw new Error(`Job '${where.id}' could not be cancelled`);
    }

    return cancelledJob;
  }

  public async paginate(query: IQueueJobPaginationQuery): Promise<IPagination<IQueueJob>> {
    return this.queuePersistor.paginate(query);
  }

  public async find(where: { id: string }): Promise<IQueueJob | null> {
    return this.queuePersistor.find(where);
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.awsSqsQueueConfig.region && !this.awsSqsQueueConfig.endpoint) {
      this.logger.debug(`SQS not configured`);
      return;
    }

    if (this.awsSqsQueueConfig.enabled) {
      this.sqsClient = new SQSClient({
        region: this.awsSqsQueueConfig.region,
        endpoint: this.awsSqsQueueConfig.endpoint,
        credentials:
          this.awsSqsQueueConfig.accessKeyId && this.awsSqsQueueConfig.secretAccessKey
            ? {
                accessKeyId: this.awsSqsQueueConfig.accessKeyId,
                secretAccessKey: this.awsSqsQueueConfig.secretAccessKey,
              }
            : undefined,
      });
    }

    if (this.awsSqsQueueConfig.runWorkers) {
      await this.runWorkers();
    }

    this.logger.debug(`Started AWS SQS queue provider`);
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.isShuttingDown = true;
    // Workers will stop polling due to isShuttingDown flag check
    this.logger.debug(`Stopped AWS SQS queue provider (${signal})`);
  }

  private async runWorkers(): Promise<void> {
    if (!this.sqsClient) {
      throw new Error(`SQS client not configured`);
    }

    for (const workerConfig of this.awsSqsQueueConfig.workers) {
      this.logger.debug(`Starting AWS SQS worker for queue: ${workerConfig.queue}`);
      this.startWorker(workerConfig);
    }
  }

  private startWorker(workerConfig: AwsSqsQueueWorkerConfig): void {
    const queueUrl = `${this.awsSqsQueueConfig.getQueueUrlPrefix()}/${workerConfig.queue}`;
    const queueKey = workerConfig.queue;

    const pollQueue = async (): Promise<void> => {
      if (this.isShuttingDown || !this.sqsClient) {
        return;
      }

      try {
        const receiveCommand = new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: workerConfig.maxNumberOfMessages,
          WaitTimeSeconds: workerConfig.waitTimeSeconds,
          VisibilityTimeout: workerConfig.visibilityTimeoutSeconds,
          MessageAttributeNames: ['All'],
        });

        const response = await this.sqsClient.send(receiveCommand);

        // Reset backoff on successful poll
        this.workerBackoffErrors.set(queueKey, 0);

        if (response.Messages && response.Messages.length > 0) {
          // Process messages in parallel
          await Promise.all(
            response.Messages.map(async (message: { Body?: string; ReceiptHandle?: string }) => {
              if (!message.Body || !message.ReceiptHandle) {
                return;
              }

              try {
                const messageData = JSON.parse(message.Body) as {
                  id: string;
                  processor: string;
                  payload: JsonObject;
                };

                // Check if job exists and is not cancelled
                const job = await this.queuePersistor.find({ id: messageData.id });
                if (!job) {
                  this.logger.warn(`Job ${messageData.id} not found in persistor, deleting from SQS`);
                  await this.deleteMessage(queueUrl, message.ReceiptHandle);
                  return;
                }

                if (job.status === QueueJobStatus.CANCELLED) {
                  this.logger.debug(`Job ${messageData.id} is cancelled, deleting from SQS`);
                  await this.deleteMessage(queueUrl, message.ReceiptHandle);
                  return;
                }

                // Update job status to running
                await this.queuePersistor.start(messageData.id);

                // Execute the job
                const executedJob = await this.queueExecutor.execute(job);

                // Update job status in persistor
                await this.queuePersistor.update(messageData.id, {
                  status: QueueJobStatus.COMPLETED,
                  doneAt: new Date(),
                  result: executedJob.result,
                });

                // Delete message from SQS after successful processing
                await this.deleteMessage(queueUrl, message.ReceiptHandle);

                this.logger.debug(`Processed job ${messageData.id} from queue ${workerConfig.queue}`);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.error(`Error processing message from queue ${workerConfig.queue}`, error);

                // Try to extract job ID from message
                try {
                  const messageData = JSON.parse(message.Body) as { id?: string };
                  if (messageData.id) {
                    await this.queuePersistor.update(messageData.id, {
                      status: QueueJobStatus.FAILED,
                      doneAt: new Date(),
                      error: errorMessage,
                    });
                  }
                } catch (parseError) {
                  this.logger.error(`Failed to parse message body for error handling`, parseError);
                }

                // Delete message from SQS on error (or implement DLQ logic here)
                await this.deleteMessage(queueUrl, message.ReceiptHandle);
              }
            }),
          );
        }

        // Continue polling immediately after processing (or after timeout with long polling)
        // This creates a continuous polling loop
        if (!this.isShuttingDown) {
          setImmediate(() => pollQueue());
        }
      } catch (error) {
        this.logger.error(`Error polling SQS queue ${workerConfig.queue}`, error);
        if (!this.isShuttingDown) {
          const errors = (this.workerBackoffErrors.get(queueKey) || 0) + 1;
          this.workerBackoffErrors.set(queueKey, errors);
          const delay = Math.min(1000 * Math.pow(2, errors - 1), 60000);
          this.logger.debug(`Retrying SQS queue ${workerConfig.queue} after ${delay}ms (errors: ${errors})`);
          setTimeout(() => pollQueue(), delay);
        }
      }
    };

    // Start polling
    pollQueue();
  }

  private async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    if (!this.sqsClient) {
      return;
    }

    try {
      await this.sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: receiptHandle,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete message from SQS`, error);
    }
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    let status = SettingsStatus.Warning;
    let statusMessage = 'Not configured';

    if (!this.awsSqsQueueConfig.enabled) {
      status = SettingsStatus.Disabled;
      statusMessage = 'Disabled';
    } else if (this.sqsClient) {
      status = SettingsStatus.Ok;
      statusMessage = 'Connected';
    } else if (this.awsSqsQueueConfig.region || this.awsSqsQueueConfig.endpoint) {
      status = SettingsStatus.Error;
      statusMessage = 'Failed to initialize';
    }

    return {
      name: 'aws-sqs',
      label: 'AWS SQS',
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: 'enabled',
              label: 'Enabled',
              value: this.awsSqsQueueConfig.enabled ? 'true' : 'false',
            },
            {
              name: 'region',
              label: 'Region',
              value: this.awsSqsQueueConfig.region,
            },
            {
              name: 'endpoint',
              label: 'Endpoint',
              value: this.awsSqsQueueConfig.endpoint,
              actions: this.awsSqsQueueConfig.endpoint ? [SettingsSettingAction.Copy] : undefined,
            },
            {
              name: 'accountId',
              label: 'Account ID',
              value: this.awsSqsQueueConfig.accountId,
            },
            {
              name: 'queueUrlPrefix',
              label: 'Queue URL Prefix',
              value: this.awsSqsQueueConfig.getQueueUrlPrefix(),
              actions: [SettingsSettingAction.Copy],
            },
            {
              name: 'runWorkers',
              label: 'Run Workers',
              value: this.awsSqsQueueConfig.runWorkers ? 'true' : 'false',
            },
            {
              name: 'workers',
              label: 'Workers',
              value: JSON.stringify(this.awsSqsQueueConfig.workers),
            },
          ]
        : undefined,
    };
  }
}

export const AwsSqsQueuePlugin: ModuleMetadata = {
  providers: [
    getConfigFactory(AwsSqsQueueConfig),
    AwsSqsQueueProvider,
    { provide: QueueProvider, useClass: AwsSqsQueueProvider },
  ],
};
