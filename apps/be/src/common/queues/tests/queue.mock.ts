import { mock } from 'node:test';

import { IPagination } from '~common/http/pagination';
import {
  IQueueJob,
  IQueueJobCreate,
  IQueueJobOptions,
  IQueueJobPaginationQuery,
  QueueJobStatus,
} from '~common/queues/models';
import type { JsonObject } from '~common/types';

import { QueueExecutorService } from '../queue.executor';
import { QueueService } from '../queue.service';
import { QueueProvider } from '../queue-provider.abstract';
import { type ProviderMock } from '~test/utils';

/**
 * Mock all calls to QueueService
 */
export const QueueServiceMock: ProviderMock<QueueService> = {
  provide: QueueService,
  useValue: {
    enqueue: mock.fn(async <Payload = JsonObject>(processorName: string, data: Payload, options?: IQueueJobOptions) => {
      return {
        id: 'mock-id',
        processor: processorName,
        payload: data,
        options: options ?? undefined,
        status: QueueJobStatus.QUEUED,
      } satisfies IQueueJob<Payload>;
    }),
  },
};

/**
 * Mock calls to Queue Providers
 */
export const QueueProviderMock: ProviderMock<QueueProvider> = {
  provide: QueueProvider,
  useValue: {
    enqueue: mock.fn(async <T = JsonObject>(job: IQueueJobCreate<T>) => {
      return {
        id: job.id ?? 'mock-id',
        processor: job.processor,
        payload: job.payload,
        options: job.options,
        status: QueueJobStatus.QUEUED,
      } satisfies IQueueJob<T>;
    }),
    cancel: mock.fn(async (where: { id: string }) => {
      return {
        id: where.id,
        processor: 'mock-processor',
        status: QueueJobStatus.CANCELLED,
      } satisfies IQueueJob;
    }),
    paginate: mock.fn(async (query: IQueueJobPaginationQuery) => {
      return {
        limit: query.limit,
        page: query.page,
        cursor: query.cursor,
        items: [],
        totalItems: 0,
      } satisfies IPagination<IQueueJob>;
    }),
    find: mock.fn(async (where: { id: string }) => {
      return {
        id: where.id,
        processor: 'mock-processor',
        status: QueueJobStatus.QUEUED,
      } satisfies IQueueJob | null;
    }),
  },
};

/**
 * Mock calls to Queue Executor
 */
export const QueueExecutorServiceMock: ProviderMock<QueueExecutorService> = {
  provide: QueueExecutorService,
  useValue: {
    execute: mock.fn(async <T = JsonObject>(job: IQueueJob<T>) => {
      return {
        ...job,
        result: { value: 'mock-result' } as JsonObject,
        status: QueueJobStatus.COMPLETED,
      } satisfies IQueueJob<T>;
    }),
  },
};
