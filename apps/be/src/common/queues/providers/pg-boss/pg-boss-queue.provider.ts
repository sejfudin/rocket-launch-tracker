import { Injectable, type ModuleMetadata, type OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { type ConstructorOptions, PgBoss } from 'pg-boss';
import { serializeError } from 'serialize-error';

import { getConfigFactory } from '~common/config';
import { IPagination } from '~common/http/pagination';
import { LoggerService } from '~common/logger';
import { QueueError } from '~common/queues/queue.exceptions';
import { ISettingsSection, SettingsPopulate, SettingsStatus } from '~common/settings';
import { JsonObject } from '~common/types';

import { IQueueJob, IQueueJobCreate, IQueueJobPaginationQuery, QueueJobStatus } from '../../models';
import { QueueConfig } from '../../queue.config';
import { QueueExecutorService } from '../../queue.executor';
import { QueueLoader } from '../../queue.loader';
import { QueuePersistor } from '../../queue-persistor.abstract';
import { QueueProvider } from '../../queue-provider.abstract';
import { PgBossQueueConfig } from './pg-boss-queue.config';

const statusMap = {
  created: QueueJobStatus.QUEUED,
  retry: QueueJobStatus.QUEUED,
  active: QueueJobStatus.RUNNING,
  completed: QueueJobStatus.COMPLETED,
  failed: QueueJobStatus.FAILED,
  cancelled: QueueJobStatus.CANCELLED,
};

interface PgBossJobData {
  processor: string;
  payload: JsonObject;
  schedule?: string;
}

@Injectable()
export class PgBossQueueProvider implements QueueProvider, OnApplicationShutdown, OnApplicationBootstrap {
  private boss?: PgBoss;

  constructor(
    private readonly logger: LoggerService,
    private readonly pgBossQueueConfig: PgBossQueueConfig,
    private readonly queueExecutor: QueueExecutorService,
    private readonly queueLoader: QueueLoader,
    private readonly queuePersistor: QueuePersistor,
  ) {}

  public async enqueue<T = JsonObject>(job: IQueueJobCreate<T>): Promise<IQueueJob<T>> {
    if (!this.boss) {
      throw new Error(`pg-boss not configured`);
    }

    const processor = this.queueLoader.processors[job.processor];
    if (!processor) {
      throw new Error(`Processor '${job.processor}' not found`);
    }

    const { processorSettings } = processor;

    const timeout = job.options?.timeout ? Math.ceil(job.options?.timeout! / 1000) * 1000 : undefined;

    const options: Parameters<typeof this.boss.send>[2] = {
      retryLimit: job.options?.retryLimit,
    };

    if (job.options?.id) {
      options.id = job.options.id.toString();
    }

    if (timeout) {
      options.expireInSeconds = timeout / 1000;
    }

    const startAfter = job.options?.startAfter ? new Date(job.options.startAfter) : undefined;
    if (startAfter) {
      options.startAfter = startAfter;
    }

    const queue = job.queue || processorSettings.queue || 'default';

    const jobId = await this.boss.send(
      queue,
      {
        processor: job.processor,
        payload: job.payload || {},
      } satisfies PgBossJobData,
      options,
    );

    if (!jobId) {
      throw new Error(`Failed to create job`);
    }

    const queueJob: IQueueJob<T> = {
      id: jobId,
      processor: job.processor,
      payload: job.payload,
      queue,
      options: {
        ...job.options,
        timeout,
      },
      status: QueueJobStatus.QUEUED,
      startAfter,
    };

    await this.queuePersistor.upsert(queueJob as IQueueJob<JsonObject>);

    return queueJob;
  }

  public async cancel(where: { id: string }): Promise<IQueueJob> {
    if (!this.boss) {
      throw new Error(`pg-boss not configured`);
    }

    const job = await this.find(where);

    if (!job) {
      throw new Error(`Job '${where.id}' not found`);
    }

    const pbJob = await this.boss.getJobById(job.queue!, where.id);
    if (!pbJob) {
      throw new Error(`Job '${where.id}' not found`);
    }

    await this.boss.cancel(pbJob.name, pbJob.id);

    try {
      return await this.queuePersistor.update(where.id, {
        status: QueueJobStatus.CANCELLED,
        doneAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to update QueuePersistor for cancelled job ${where.id}`, error);
      throw error;
    }
  }

  public async paginate(query: IQueueJobPaginationQuery): Promise<IPagination<IQueueJob>> {
    if (!this.boss) {
      throw new Error(`pg-boss not configured`);
    }
    return this.queuePersistor.paginate(query);
  }

  public async find(where: { id: string }): Promise<IQueueJob | null> {
    if (!this.boss) {
      throw new Error(`pg-boss not configured`);
    }
    return await this.queuePersistor.find(where);
  }

  private async setupQueues() {
    if (!this.boss) {
      throw new Error(`pg-boss not configured`);
    }
    const queues = (await this.boss?.getQueues()) || [];

    const queuesConfig = this.pgBossQueueConfig.queues || [];

    if (queuesConfig.length === 0) {
      queuesConfig.push(
        // default queue
        {
          name: 'default',
          policy: 'standard',
        },
      );
    }

    for (const queueConfig of queuesConfig) {
      const queue = queues.find((q: { name: string }) => q.name === queueConfig.name);
      if (!queue) {
        this.logger.debug(`Creating queue: ${queueConfig.name}`, queueConfig);
        await this.boss?.createQueue(queueConfig.name, { ...queueConfig });
      } else {
        // check if queue needs to be updated
        // todo, this could be tricky, check if we can do any sort of versioning
        if (Object.keys(queueConfig).some((key) => (queueConfig as any)[key] !== (queue as any)[key])) {
          this.logger.debug(`Updating queue: ${queueConfig.name}`, { queue, queueConfig });
          await this.boss?.updateQueue(queueConfig.name);
        }
      }
    }
    for (const queue of queues.filter((q: { name: string }) => !q.name.startsWith('__'))) {
      if (!this.pgBossQueueConfig.queues.find((queueConfig) => queueConfig.name === queue.name)) {
        // todo, delete the queue ?
        this.logger.debug(`Found defunct queue: ${queue.name}`, { queue });
      }
    }
  }

  private async runWorkers() {
    if (!this.boss) {
      throw new Error(`pg-boss not configured`);
    }

    const workersConfig = this.pgBossQueueConfig.workers || [];
    if (workersConfig.length === 0) {
      workersConfig.push(
        // default worker
        {
          queue: 'default',
          priority: true,
          pollingIntervalSeconds: 2,
          batchSize: 2,
        },
      );
    }

    /**
     * Set up workers for each queue as per their configuration
     *  - global concurrency can not be set with workers, set queue policy instead
     *  - if a worker throws, it will be retried
     */
    for (const workerConfig of workersConfig) {
      const { queue, ...config } = workerConfig;
      this.logger.debug(`Starting queue worker: ${queue}`, config);
      await this.boss.work(
        queue,
        {
          ...config,
          includeMetadata: true,
        },
        async (jobs) => {
          if (!Array.isArray(jobs) || jobs.length === 0 || !this.boss) {
            return;
          }

          for (const job of jobs) {
            let queueJob: IQueueJob | null = null;

            const payload = job.data as PgBossJobData;

            if (payload.schedule) {
              queueJob = await this.queuePersistor.upsert({
                id: job.id,
                status: QueueJobStatus.RUNNING,
                processor: payload.processor,
                payload: payload.payload,
                queue: job.name,
              });
            } else {
              queueJob = await this.queuePersistor.update(job.id, { status: QueueJobStatus.RUNNING });
            }

            try {
              const executedJob = await this.queueExecutor.execute(queueJob);
              await this.queuePersistor.update(queueJob.id, {
                status: QueueJobStatus.COMPLETED,
                result: executedJob.result,
                doneAt: new Date(),
              });
              await this.boss.deleteJob(queueJob.queue!, queueJob.id);
            } catch (e) {
              const error =
                e instanceof QueueError
                  ? e
                  : new QueueError(e instanceof Error ? e.message : 'Job execution failed', { job, cause: e });
              const details = serializeError(error.cause) as JsonObject;
              if (job.retryLimit && job.retryCount < job.retryLimit) {
                await this.boss.fail(queueJob.queue!, queueJob.id);
                await this.queuePersistor.update(queueJob.id, {
                  status: QueueJobStatus.RETRY,
                  result: {
                    retriesLeft: job.retryLimit - job.retryCount - 1,
                    error: e instanceof QueueError ? e.message : 'Job execution failed',
                    details,
                  },
                });
              } else {
                await this.boss.deleteJob(queueJob.queue!, queueJob.id);
                await this.queuePersistor.update(queueJob.id, {
                  status: QueueJobStatus.FAILED,
                  doneAt: new Date(),
                  result: {
                    error: e instanceof QueueError ? e.message : 'Job execution failed',
                    details,
                  },
                });
              }
            }
          }
        },
      );
    }
  }

  async onApplicationBootstrap(): Promise<void> {
    if (!this.pgBossQueueConfig.url) {
      this.logger.debug(`pg-boss not configured`);
      return;
    }

    /**
     * @see https://timgit.github.io/pg-boss/#/./api/constructor
     */
    const config: ConstructorOptions = {
      connectionString: this.pgBossQueueConfig.url,

      // The schema to create the tables in
      schema: this.pgBossQueueConfig.schema,

      // Maximum number of connections that will be shared by all operations in this instance
      max: this.pgBossQueueConfig.maxConnections,

      // Application name
      // application_name: 'pg-boss',

      // connect to servers that require ssl
      ssl: this.pgBossQueueConfig.ssl
        ? {
            rejectUnauthorized: false,
          }
        : undefined,

      // Listen to scheduled jobs
      schedule: this.pgBossQueueConfig.schedule,

      // Run migrations on start
      migrate: this.pgBossQueueConfig.migrate,
    };

    if (this.pgBossQueueConfig.maintenanceIntervalSeconds) {
      // How often maintenance operations are run against the job and archive tables.
      config.maintenanceIntervalSeconds = this.pgBossQueueConfig.maintenanceIntervalSeconds;
    }

    this.boss = new PgBoss(config);

    /**
     * The error event could be raised during internal processing, such as scheduling and maintenance.
     * Adding a listener to the error event is strongly encouraged because of the default behavior of Node.
     */
    this.boss.on('error', (error: Error) => this.logger.error(error));

    /**
     * Start the pg-boss instance.
     *  - run migrations
     */
    await this.boss.start();

    if (this.pgBossQueueConfig.setupQueues) {
      await this.setupQueues();
    }

    if (this.pgBossQueueConfig.runWorkers) {
      await this.runWorkers();
    }

    // Apply cron jobs from processors
    await this.setupCronJobs();

    this.logger.debug(`Started pg-boss ( schema version: ${await this.boss.schemaVersion()} )`);
  }

  private async setupCronJobs() {
    if (!this.boss || !this.pgBossQueueConfig.schedule) {
      return;
    }

    const cronJobKeys: Record<
      string,
      {
        queue: string;
        cron: string;
        data: PgBossJobData;
        options: {
          tz?: string;
          key?: string;
        };
      }
    > = {};
    for (const [processorName, processor] of Object.entries(this.queueLoader.processors)) {
      const cronJobs = processor.processorSettings.cronJobs || [];
      let i = 0;
      for (const cronJob of cronJobs || []) {
        const queue = cronJob.queue || processor.processorSettings.queue || 'default';
        const key = `${processorName}-${i}`.replace(/:/g, '-');
        cronJobKeys[key] = {
          queue,
          cron: cronJob.cron,
          data: {
            payload: cronJob.payload || {},
            processor: processorName,
            schedule: key,
          },
          options: {
            tz: cronJob.timezone || 'UTC',
            key,
          },
        };
        i += 1;
      }
    }

    for (const pgBossSchedule of await this.boss.getSchedules()) {
      if (!pgBossSchedule.key) {
        this.logger.error(`Cron schedule has no key: ${JSON.stringify(pgBossSchedule)}`);
        continue;
      }
      if (pgBossSchedule.key in cronJobKeys) {
        // check if schedule needs to be updated
        const cronJob = cronJobKeys[pgBossSchedule.key];
        if (
          cronJob.queue !== pgBossSchedule.name ||
          cronJob.cron !== pgBossSchedule.cron ||
          JSON.stringify(cronJob.data) !== JSON.stringify(pgBossSchedule.data) ||
          JSON.stringify(cronJob.options) !== JSON.stringify(pgBossSchedule.options)
        ) {
          this.logger.debug(`Cron schedule needs to be updated: ${pgBossSchedule.key}`);
          await this.boss.unschedule(pgBossSchedule.name, pgBossSchedule.key);
        } else {
          delete cronJobKeys[pgBossSchedule.key];
        }
      } else {
        this.logger.debug(`Removing defunct cron schedule: ${pgBossSchedule.key}`);
        await this.boss.unschedule(pgBossSchedule.name, pgBossSchedule.key);
      }
    }

    for (const [key, cronJob] of Object.entries(cronJobKeys)) {
      this.logger.debug(`Upserting cron schedule: ${key}`);
      await this.boss.schedule(cronJob.queue!, cronJob.cron, cronJob.data, cronJob.options);
    }
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    if (this.boss) {
      try {
        this.logger.debug(`Stopping pg-boss (${signal})`);
        /**
         * Gracefully stop all workers and maintenance operations
         */
        await this.boss?.stop({
          /**
           * Wait for jobs to complete
           * todo listen to signal
           */
          graceful: this.pgBossQueueConfig.stopTimeout > 0,

          // Maximum time to wait for jobs to complete
          timeout: this.pgBossQueueConfig.stopTimeout,

          // Close the database connection
          close: true,
        });
      } catch (error) {
        this.logger.error(`Error stopping pg-boss`, error);
        throw error;
      }
    }
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    let status = SettingsStatus.Warning;
    let statusMessage = 'Not configured';

    if (this.boss) {
      try {
        const schemaVersion = await this.boss.schemaVersion();
        status = SettingsStatus.Ok;
        statusMessage = `Connected (schema version: ${schemaVersion})`;
      } catch (error) {
        status = SettingsStatus.Error;
        statusMessage = 'Connection error';
      }
    } else if (this.pgBossQueueConfig.url) {
      status = SettingsStatus.Error;
      statusMessage = 'Failed to initialize';
    }

    return {
      name: 'pg-boss',
      label: 'PostgreSQL Queue (pg-boss)',
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: 'schema',
              label: 'Schema',
              value: this.pgBossQueueConfig.schema,
            },
            {
              name: 'migrate',
              label: 'Run Migrations',
              value: this.pgBossQueueConfig.migrate ? 'true' : 'false',
            },
            {
              name: 'setupQueues',
              label: 'Setup Queues',
              value: this.pgBossQueueConfig.setupQueues ? 'true' : 'false',
            },
            {
              name: 'queues',
              label: 'Queues',
              value: JSON.stringify(this.pgBossQueueConfig.queues),
            },
            {
              name: 'schedule',
              label: 'Schedule',
              value: this.pgBossQueueConfig.schedule ? 'true' : 'false',
            },
            {
              name: 'maintenanceIntervalSeconds',
              label: 'Maintenance Interval',
              value: this.pgBossQueueConfig.maintenanceIntervalSeconds?.toString(),
            },
            {
              name: 'stopTimeout',
              label: 'Stop Timeout',
              value: this.pgBossQueueConfig.stopTimeout.toString(),
            },
            {
              name: 'runWorkers',
              label: 'Run Workers',
              value: this.pgBossQueueConfig.runWorkers ? 'true' : 'false',
            },
            {
              name: 'workers',
              label: 'Workers',
              value: JSON.stringify(this.pgBossQueueConfig.workers),
            },
          ]
        : undefined,
    };
  }
}

export const PgBossQueuePlugin: ModuleMetadata = {
  providers: [
    getConfigFactory(QueueConfig),
    getConfigFactory(PgBossQueueConfig),
    { provide: QueueProvider, useClass: PgBossQueueProvider },
  ],
  exports: [QueueProvider],
};
