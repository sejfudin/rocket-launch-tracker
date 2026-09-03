import { Injectable, ModuleMetadata, type OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { CronExpressionParser } from 'cron-parser';
import { serializeError } from 'serialize-error';

import { IPagination } from '~common/http/pagination';
import { LoggerService } from '~common/logger';
import { ISettingsSection, SettingsPopulate, SettingsStatus } from '~common/settings';
import { JsonObject } from '~common/types';
import { makeId } from '~common/utils/short-uuid';

import { IQueueJob, IQueueJobCreate, IQueueJobOptions, IQueueJobPaginationQuery, QueueJobStatus } from '../../models';
import { QueueError } from '../../queue.exceptions';
import { QueueExecutorService } from '../../queue.executor';
import { QueueLoader } from '../../queue.loader';
import { QueueProvider } from '../../queue-provider.abstract';

@Injectable()
export class HotwireQueueProvider implements QueueProvider, OnApplicationShutdown, OnApplicationBootstrap {
  private cronTimers: Map<string, NodeJS.Timeout> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private inMemoryJobs: Map<string, IQueueJob> = new Map();
  private readonly MAX_NON_ACTIVE_JOBS = 5;

  constructor(
    private readonly logger: LoggerService,
    private readonly queueExecutor: QueueExecutorService,
    private readonly queueLoader: QueueLoader,
  ) {}

  public async enqueue<T = JsonObject>(job: IQueueJobCreate<T>): Promise<IQueueJob<T>> {
    const jobId = job.id || makeId();

    const existingJob = this.inMemoryJobs.get(jobId);
    if (existingJob?.status === QueueJobStatus.RUNNING) {
      throw new Error(`Job is already running (status: ${existingJob.status})`);
    }

    const now = new Date();
    const startAfter = job.options?.startAfter ? new Date(job.options.startAfter) : undefined;
    const jobStub: IQueueJob<T> = {
      ...job,
      id: jobId,
      status: QueueJobStatus.QUEUED,
      createdAt: now,
      updatedAt: now,
      startAfter,
    };

    this.inMemoryJobs.set(jobId, jobStub as IQueueJob<JsonObject>);

    this.scheduledJobs.set(
      jobId,
      setTimeout(
        () => {
          this.executeJob(jobId);
        },
        startAfter ? startAfter.getTime() - Date.now() : 0,
      ),
    );

    return jobStub as IQueueJob<T>;
  }

  public async cancel(where: { id: string }): Promise<IQueueJob> {
    const job = this.inMemoryJobs.get(where.id);
    if (!job || job.status !== QueueJobStatus.QUEUED) {
      throw new Error(`Job can not be cancelled (status: ${job?.status})`);
    }
    return this.updateJob(where.id, { status: QueueJobStatus.CANCELLED, doneAt: new Date() })!;
  }

  public async paginate(query: IQueueJobPaginationQuery): Promise<IPagination<IQueueJob>> {
    let items = Array.from(this.inMemoryJobs.values());

    if (query.filter) {
      const { ids, processor, status } = query.filter;
      items = items.filter((job) => {
        if (ids && !ids.includes(job.id)) return false;
        if (processor && job.processor !== processor) return false;
        if (status && job.status !== status) return false;
        return true;
      });
    }

    if (query.order && query.order.length > 0) {
      const order = query.order[0]!;
      const property = order.property;
      const getStringValue = (value: IQueueJob, property: string): string => {
        switch (property) {
          case 'id':
          case 'processor':
          case 'status':
            return value[property] ?? '';
          case 'createdAt':
          case 'updatedAt':
          case 'startAfter':
          case 'startedAt':
          case 'doneAt':
            return value ? (value[property]?.toISOString() ?? '') : '';
          default:
            throw new Error(`Invalid property: ${property}`);
        }
      };
      items.sort((a, b) => {
        const comparison = getStringValue(a, property).localeCompare(getStringValue(b, property));
        return order.direction === 'asc' ? comparison : -comparison;
      });
    } else {
      items.sort((a, b) => {
        const aTime = a.updatedAt?.getTime() ?? 0;
        const bTime = b.updatedAt?.getTime() ?? 0;
        return bTime - aTime;
      });
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const paginatedItems = items.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      page,
      limit,
      totalItems: items.length,
    };
  }

  public async find(where: { id: string }): Promise<IQueueJob | null> {
    return this.inMemoryJobs.get(where.id) || null;
  }

  async onApplicationBootstrap() {
    this.logger.debug('Started hotwire queue provider (in-memory mode)');

    await this.setupCronJobs();
  }

  async onApplicationShutdown() {
    this.cronTimers.forEach((timer) => clearTimeout(timer));
    this.cronTimers.clear();

    this.scheduledJobs.forEach((timer) => clearTimeout(timer));
    this.scheduledJobs.clear();

    this.logger.debug('Stopped hotwire queue provider');
  }

  private async executeJob(id: string) {
    let job = this.inMemoryJobs.get(id);
    if (!job || job.status !== QueueJobStatus.QUEUED) {
      return;
    }
    try {
      job = this.updateJob(id, { status: QueueJobStatus.RUNNING, startedAt: new Date() });
      if (!job) {
        return;
      }
      job = await this.queueExecutor.execute(job);
      this.updateJob(id, { ...job, status: QueueJobStatus.COMPLETED, doneAt: new Date(), result: job.result });
    } catch (e) {
      const error = e instanceof QueueError ? e : new QueueError('Job execution failed', { job, cause: e });
      const details = serializeError(error.cause) as JsonObject;
      this.updateJob(id, {
        status: QueueJobStatus.FAILED,
        doneAt: new Date(),
        payload: { error: error.message, details },
      });
    }
  }

  private updateJob(
    id: string,
    updates: {
      payload?: JsonObject;
      options?: IQueueJobOptions;
      status?: QueueJobStatus;
      startAfter?: Date;
      doneAt?: Date;
      startedAt?: Date;
      result?: JsonObject;
    },
  ): IQueueJob | undefined {
    let job = this.inMemoryJobs.get(id);

    if (!job) {
      return;
    }

    job = {
      ...job,
      ...updates,
    };

    job.updatedAt = new Date();

    if (job.status !== QueueJobStatus.QUEUED) {
      const scheduledTimer = this.scheduledJobs.get(job.id);
      if (scheduledTimer) {
        clearTimeout(scheduledTimer);
        this.scheduledJobs.delete(job.id);
      }
    }

    this.inMemoryJobs.set(job.id, job);

    // limit to 10 non-active jobs
    Array.from(this.inMemoryJobs.values())
      .filter((job) =>
        [QueueJobStatus.COMPLETED, QueueJobStatus.FAILED, QueueJobStatus.CANCELLED].includes(job.status!),
      )
      .sort((b, a) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0))
      .slice(this.MAX_NON_ACTIVE_JOBS)
      .forEach((job) => this.inMemoryJobs.delete(job.id));

    return job;
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
        const cronLoop = (run?: boolean) => {
          if (run) {
            const existingJob = this.inMemoryJobs.get(jobId);
            if (existingJob?.status !== QueueJobStatus.RUNNING) {
              this.enqueue(jobStub);
            }
          }
          const nextExecution = CronExpressionParser.parse(cronJob.cron, { tz: cronJob.timezone }).next();
          const delay = nextExecution.getTime() - Date.now();
          setTimeout(() => cronLoop(true), delay > 0 ? delay : 0);
        };
        cronLoop();
      });
    }
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    const status = SettingsStatus.Warning;
    const statusMessage = 'In-memory (no persistence)';

    return {
      name: 'hotwire',
      label: 'In-Memory Queue',
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: 'MAX_NON_ACTIVE_JOBS',
              label: 'Max Non-Active Jobs',
              value: this.MAX_NON_ACTIVE_JOBS.toString(),
            },
          ]
        : undefined,
    };
  }
}

/**
 * Hotwire queue module
 *  Directly runs all requests in the same process
 *  Uses in-memory storage only (no persistence)
 */
export const HotwireQueuePlugin: ModuleMetadata = {
  providers: [{ provide: QueueProvider, useClass: HotwireQueueProvider }],
};
