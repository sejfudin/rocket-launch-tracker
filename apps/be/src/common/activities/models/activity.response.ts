import { Expose } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

import { IActivity } from './activity.types';

export class ActivityResponse {
  @Expose()
  @IsUUID()
  readonly id!: string;

  @Expose()
  @IsString()
  readonly module!: string;

  @Expose()
  @IsString()
  readonly type!: string;

  @Expose()
  @IsDate()
  readonly timestamp!: Date;

  @Expose()
  @IsJsonObject()
  readonly payload!: JsonObject;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly userId?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly resourceId?: string;

  constructor(data: IActivityResponse) {
    Object.assign(this, data);
  }

  static fromDomain(activity: IActivity): ActivityResponse {
    return new ActivityResponse({
      id: activity.id,
      module: activity.module,
      type: activity.type,
      timestamp: activity.timestamp,
      payload: activity.payload,
      userId: activity.userId,
      resourceId: activity.resourceId,
    });
  }
}

export interface IActivityResponse extends ActivityResponse {}
