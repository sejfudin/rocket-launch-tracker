import { Expose } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

import { IPushNotificationSendMessage } from '~common/push-notifications/push-notification.service';
import { JsonObject } from '~common/types';
import { IsJsonObject, TransformInputToBoolean } from '~common/validate';

export class PushNotificationSendAdminRequest {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly tokens?: string[];

  /**
   * Resource name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly resourceName?: string;

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  @IsOptional()
  readonly sendToAll?: boolean;

  /**
   * Optional title override
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly title?: string;

  /**
   * Optional body override
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly body?: string;

  /**
   * Optional image url override
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly imageUrl?: string;

  /**
   * Custom Data
   */
  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly data?: JsonObject;

  toDomain(): IPushNotificationSendMessage {
    return {
      title: this.title,
      body: this.body,
      imageUrl: this.imageUrl,
      data: this.data,
      resourceName: this.resourceName,
      tokens: this.tokens,
    };
  }
}
