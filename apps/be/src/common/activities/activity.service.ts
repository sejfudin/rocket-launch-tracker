import { Injectable } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { LoggerService } from '~common/logger';
import { makeUUID } from '~common/utils/short-uuid';

import { Transaction } from '~database/types';

import { ActivityConfig, ActivityMode } from './activity.config';
import { ActivityRepository } from './activity.repository';
import { IActivity, IActivityCreate } from './models/activity.types';
import { IActivityAggregation, IActivityAggregationQuery } from './models/activity-aggregation.request';
import { IActivityPaginationQuery } from './models/activity-pagination.request';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activitiesConfig: ActivityConfig,
    private readonly logger: LoggerService,
  ) {}

  async create(data: IActivityCreate, options?: {}, tx?: Transaction): Promise<IActivity | null> {
    if (this.activitiesConfig.mode === ActivityMode.DISABLED) {
      return null;
    }

    const activityData: IActivityCreate = {
      ...data,
      id: data.id ?? makeUUID(),
      timestamp: data.timestamp ?? new Date(),
    };

    if (tx) {
      return await this.activityRepository.create(activityData, tx);
    }

    if (this.activitiesConfig.mode === ActivityMode.DEFFERED) {
      setImmediate(() => {
        this.activityRepository.create(activityData).catch((e) => {
          this.logger.error(e, 'Error creating activity');
        });
      });
      return activityData as IActivity;
    }
    return await this.activityRepository.create(activityData);
  }

  async paginate(query: IActivityPaginationQuery): Promise<IPagination<IActivity>> {
    return await this.activityRepository.paginate(query);
  }

  async aggregate(query: IActivityAggregationQuery): Promise<IActivityAggregation[]> {
    return await this.activityRepository.aggregate(query);
  }

  async find(where: { id: string }): Promise<IActivity | null> {
    return await this.activityRepository.find(where);
  }
}
