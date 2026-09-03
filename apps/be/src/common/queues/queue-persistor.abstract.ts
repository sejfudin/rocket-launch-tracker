import { type IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import { IQueueJob, IQueueJobPaginationQuery, IQueueJobUpdate } from './models';

export abstract class QueuePersistor {
  abstract upsert(data: IQueueJob, tx?: Transaction): Promise<IQueueJob>;
  abstract find(where: { id: string }, tx?: Transaction): Promise<IQueueJob | null>;
  abstract update(id: string, data: IQueueJobUpdate, tx?: Transaction): Promise<IQueueJob>;
  abstract paginate(query: IQueueJobPaginationQuery, tx?: Transaction): Promise<IPagination<IQueueJob>>;
  abstract cancel(where: { id: string }, tx?: Transaction): Promise<IQueueJob>;
  abstract listUpcoming(maxStartTime?: Date): Promise<IQueueJob[]>;
  abstract start(id: string, tx?: Transaction): Promise<IQueueJob | null>;

  abstract transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
