import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

import { IPushNotificationSendMessage } from '~common/push-notifications/push-notification.service';
import { JsonObject } from '~common/types';
import { IsJsonObject, TransformInputToBoolean } from '~common/validate';

export class PushNotificationTemplateAdminSendRequestVariable {
  @Expose()
  @IsString()
  readonly param!: string;

  @Expose()
  @IsString()
  readonly value!: string;
}

export class PushNotificationTemplateAdminSendRequest {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly tokens?: string[];

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

  @Expose()
  @IsString()
  readonly templateName!: string;

  @Expose()
  @Type(() => PushNotificationTemplateAdminSendRequestVariable)
  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  readonly templateVariables?: PushNotificationTemplateAdminSendRequestVariable[];

  toDomain(): IPushNotificationSendMessage {
    return {
      title: this.title,
      body: this.body,
      imageUrl: this.imageUrl,
      data: this.data,
      resourceName: this.resourceName,
      tokens: this.tokens,
      template: this.templateName,
      templateValues: this.templateVariables?.reduce((acc, curr) => {
        acc[curr.param] = curr.value;
        return acc;
      }, {} as JsonObject),
    };
  }
}
