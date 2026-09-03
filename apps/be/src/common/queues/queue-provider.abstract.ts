import { IPagination } from '~common/http/pagination';
import { ISettingsSection, SettingsPopulate } from '~common/settings';
import { JsonObject } from '~common/types';

import type { IQueueJob, IQueueJobCreate, IQueueJobPaginationQuery } from './models';

export abstract class QueueProvider {
  abstract enqueue<T = JsonObject>(job: IQueueJobCreate<T>): Promise<IQueueJob<T>>;
  abstract cancel(where: { id: string }): Promise<IQueueJob>;

  abstract paginate(query: IQueueJobPaginationQuery): Promise<IPagination<IQueueJob>>;
  abstract find(where: { id: string }): Promise<IQueueJob | null>;

  abstract getSettings?(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection>;
}
