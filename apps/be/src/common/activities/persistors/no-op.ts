import { Injectable, type ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { JsonObject } from '~common/types';

import { prismaResultToPagination } from '~database/prisma';

import { ActivityRepository } from '../activity.repository';
import { IActivity, IActivityCreate } from '../models/activity.types';
import { IActivityAggregation } from '../models/activity-aggregation.request';
import { IActivityPaginationQuery } from '../models/activity-pagination.request';

@Injectable()
export class NoOpActivityRepository extends ActivityRepository {
  async create(data: IActivityCreate): Promise<IActivity> {
    return {
      id: 'no-op',
      timestamp: new Date(),
      payload: data.payload as JsonObject,
      module: data.module,
      type: data.type,
      userId: data.userId,
      resourceId: data.resourceId,
    };
  }

  async paginate(query: IActivityPaginationQuery): Promise<IPagination<IActivity>> {
    return {
      items: [],
      ...prismaResultToPagination(query, { items: [] }),
    } satisfies IPagination<IActivity>;
  }

  async aggregate(): Promise<IActivityAggregation[]> {
    return [];
  }

  async find(): Promise<IActivity | null> {
    return null;
  }
}

/**
 * Disable activities repository by doing nothing on calls
 */
export const NoOpActivityPersistorPlugin: ModuleMetadata = {
  providers: [{ provide: ActivityRepository, useClass: NoOpActivityRepository }],
  exports: [ActivityRepository],
};
