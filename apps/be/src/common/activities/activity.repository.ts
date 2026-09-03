import { type IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import { IActivity, IActivityCreate } from './models/activity.types';
import { IActivityAggregation, IActivityAggregationQuery } from './models/activity-aggregation.request';
import { IActivityPaginationQuery } from './models/activity-pagination.request';

export abstract class ActivityRepository {
  abstract create(data: IActivityCreate, tx?: Transaction): Promise<IActivity>;

  abstract paginate(query: IActivityPaginationQuery, tx?: Transaction): Promise<IPagination<IActivity>>;

  abstract aggregate(query: IActivityAggregationQuery, tx?: Transaction): Promise<IActivityAggregation[]>;

  abstract find(where: { id: string }, tx?: Transaction): Promise<IActivity | null>;
}
