import { Injectable, ModuleMetadata, type OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import { serializeError } from 'serialize-error';

import { IPagination } from '~common/http/pagination';
import { LoggerService } from '~common/logger';
import { ISettingsSection, SettingsPopulate, SettingsStatus } from '~common/settings';
import { JsonObject } from '~common/types';
import { makeId } from '~common/utils/short-uuid';

import { PrismaModule } from '~database/prisma';

import { IQueueJob, IQueueJobCreate, IQueueJobPaginationQuery, QueueJobStatus } from '../../models';
import { QueueError } from '../../queue.exceptions';
import { QueueExecutorService } from '../../queue.executor';
import { QueueLoader } from '../../queue.loader';
import { QueuePersistor } from '../../queue-persistor.abstract';
import { QueueProvider } from '../../queue-provider.abstract';

@Injectable()
export class PrismaQueueProvider implements QueueProvider, OnApplicationShutdown, OnApplicationBootstrap {
  private cronTimers: Map<string, NodeJS.Timeout> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly logger: LoggerService,
    private readonly queueExecutor: QueueExecutorService,
    private readonly queueLoader: QueueLoader,
    private readonly queuePersistor: QueuePersistor,
  ) {}

  public async enqueue<T = JsonObject>(job: IQueueJobCreate<T>): Promise<IQueueJob<T>> {
    const jobId = job.id || makeId();

    const startAfter = job.options?.startAfter ? new Date(job.options.startAfter) : undefined;
    const createdJob = await this.queuePersistor.transaction(async (tx) => {
      const existingJob = await this.queuePersistor.find({ id: jobId }, tx);
      if (existingJob?.status === QueueJobStatus.RUNNING) {
        throw new QueueError(`Job is already running (status: ${existingJob.status})`, {
          job: existingJob,
          code: 'job-already-running',
        });
      }

      return await this.queuePersistor.upsert(
        {
          ...job,
          id: jobId,
          status: QueueJobStatus.QUEUED,
          startAfter,
        } as IQueueJob<JsonObject>,
        tx,
      );
    });

    this.scheduledJobs.set(
      jobId,
      setTimeout(
        () => {
          this.executeJob(jobId);
        },
        startAfter ? startAfter.getTime() - Date.now() : 0,
      ),
    );

    return createdJob as IQueueJob<T>;
  }

  public async cancel(where: { id: string }): Promise<IQueueJob> {
    let job: IQueueJob | null = null;

    try {
      job = await this.queuePersistor.cancel(where);
    } catch (error) {
      throw new QueueError(`Job could not be cancelled`, { job, cause: error });
    }

    const scheduledTimer = this.scheduledJobs.get(where.id);
    if (scheduledTimer) {
      clearTimeout(scheduledTimer);
      this.scheduledJobs.delete(where.id);
    }

    return job;
  }

  public async paginate(query: IQueueJobPaginationQuery): Promise<IPagination<IQueueJob>> {
    return this.queuePersistor.paginate(query);
  }

  public async find(where: { id: string }): Promise<IQueueJob | null> {
    return this.queuePersistor.find(where);
  }

  async onApplicationBootstrap() {
    this.logger.debug('Started Prisma queue provider');

    await this.loadUpcomingJobs();
    await this.setupCronJobs();
  }

  async onApplicationShutdown() {
    this.cronTimers.forEach((timer) => clearTimeout(timer));
    this.cronTimers.clear();

    this.scheduledJobs.forEach((timer) => clearTimeout(timer));
    this.scheduledJobs.clear();

    this.logger.debug('Stopped Prisma queue provider');
  }

  private async loadUpcomingJobs() {
    const upcomingJobs = await this.queuePersistor.listUpcoming();

    for (const job of upcomingJobs) {
      const delay = job.startAfter ? Math.max(0, job.startAfter.getTime() - Date.now()) : 0;
      this.scheduledJobs.set(
        job.id,
        setTimeout(() => {
          this.executeJob(job.id);
        }, delay),
      );
    }

    this.logger.debug(`Loaded ${upcomingJobs.length} upcoming jobs`);
  }

  private async executeJob(id: string) {
    let job: IQueueJob | null = null;
    try {
      job = await this.queuePersistor.start(id);
      if (!job) {
        return;
      }
      job = await this.queueExecutor.execute(job);
      await this.queuePersistor.update(id, {
        status: QueueJobStatus.COMPLETED,
        doneAt: new Date(),
        result: job.result,
      });
    } catch (e) {
      const error = e instanceof QueueError ? e : new QueueError('Job execution failed', { job, cause: e });
      const details = serializeError(error.cause) as JsonObject;
      await this.queuePersistor.update(id, {
        status: QueueJobStatus.FAILED,
        doneAt: new Date(),
        result: {
          error: error.message,
          details,
        },
      });
    } finally {
      this.scheduledJobs.delete(id);
    }
  }

  private async setupCronJobs() {
    for (const [processor, { processorSettings }] of Object.entries(this.queueLoader.processors)) {
      (processorSettings.cronJobs || []).forEach((cronJob, index) => {
        const jobId = `${processor}-cron-${index}`;
        const jobStub: IQueueJobCreate = {
          id: jobId,
          processor: cronJob.processor,
          payload: cronJob.payload,
          options: cronJob.options,
        };
        const cronLoop = async (run?: boolean) => {
          if (run) {
            await this.enqueue(jobStub).catch((e) => {
              this.logger.error(`Failed to enqueue job ${jobId}`, e);
            });
          }
          const nextExecution = CronExpressionParser.parse(cronJob.cron, { tz: cronJob.timezone }).next();
          const delay = nextExecution.getTime() - Date.now();
          setTimeout(() => cronLoop(true), delay > 0 ? delay : 0);
        };
        cronLoop();
      });
    }
  }

  async getSettings(_options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    const status = SettingsStatus.Warning;
    const statusMessage = 'Running (in-process, single instance only)';

    return {
      name: 'prisma',
      label: 'Prisma Database Queue',
      status,
      statusMessage,
    };
  }
}

/**
 * Prisma queue module
 *  Directly runs all requests in the same process
 *  Uses Prisma to persist jobs to the database
 *  Not suitable for production, single instance only
 */
export const PrismaQueuePlugin: ModuleMetadata = {
  imports: [PrismaModule.forRoot()],
  providers: [{ provide: QueueProvider, useClass: PrismaQueueProvider }],
};
