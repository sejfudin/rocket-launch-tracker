import { Expose } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

import { IActivityAggregation } from '~common/activities/models/activity-aggregation.request';

export class ActivityAggregationResponse {
  @Expose()
  @IsDate()
  readonly bucket!: Date;

  @Expose()
  @IsNumber()
  readonly count!: number;

  constructor(data: IActivityAggregationResponse) {
    Object.assign(this, data);
  }

  static fromDomain(aggregation: IActivityAggregation): ActivityAggregationResponse {
    return new ActivityAggregationResponse({
      bucket: aggregation.bucket,
      count: aggregation.count,
    });
  }
}

export interface IActivityAggregationResponse extends ActivityAggregationResponse {}
