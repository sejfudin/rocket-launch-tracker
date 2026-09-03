import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { IActivity } from '~common/activities/models';
import { BaseLogLevelEnum } from '~common/logger/base-logger.config';
import {
  IPushNotificationLog,
  IPushNotificationMessageResponse,
  PushNotificationLogEvent,
} from '~common/push-notifications/models';
import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

export class PushNotificationActivityAdminResponse {
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
  @IsUUID()
  @IsOptional()
  readonly userId?: string;

  @Expose()
  @IsUUID()
  @IsOptional()
  readonly resourceId?: string;

  @Expose()
  @IsEnum(PushNotificationLogEvent)
  @IsOptional()
  @ApiPropertyOptional({ enum: PushNotificationLogEvent, enumName: 'PushNotificationLogEvent' })
  readonly event?: PushNotificationLogEvent;

  @Expose()
  @IsEnum(BaseLogLevelEnum)
  @IsOptional()
  @ApiPropertyOptional({ enum: BaseLogLevelEnum, enumName: 'BaseLogLevelEnum' })
  readonly level?: BaseLogLevelEnum;

  @Expose()
  @IsString()
  @IsOptional()
  readonly provider?: string;

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  readonly deviceTokens?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly title?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly body?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly template?: string;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly templateValues?: JsonObject;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly data?: JsonObject;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly response?: IPushNotificationMessageResponse[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly failedMessage?: string;

  constructor(data: IPushNotificationActivityAdminResponse) {
    Object.assign(this, data);
  }

  static fromDomain(activity: IActivity): PushNotificationActivityAdminResponse {
    const payload = activity.payload as unknown as IPushNotificationLog;

    return new PushNotificationActivityAdminResponse({
      id: activity.id,
      module: activity.module,
      type: activity.type,
      timestamp: activity.timestamp,
      userId: activity.userId,
      resourceId: activity.resourceId,

      event: payload.event,
      level: payload.level,
      provider: payload.provider,
      deviceTokens: payload.deviceTokens,
      title: payload.title,
      body: payload.body,
      template: payload.template,
      templateValues: payload.templateValues,
      data: payload.data,
      response: payload.response,
      failedMessage: payload.failedMessage,
    });
  }
}

export interface IPushNotificationActivityAdminResponse extends PushNotificationActivityAdminResponse {}
