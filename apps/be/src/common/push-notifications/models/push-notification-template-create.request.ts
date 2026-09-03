import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

import {
  IPushNotificationTemplateCreate,
  PushNotificationTemplateType,
} from '~common/push-notifications/models/push-notification-template.types';
import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

export class PushNotificationTemplateCreateRequest {
  @Expose()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'name must contain only lowercase letters, numbers, and dashes',
  })
  readonly name!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly body!: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly imageUrl?: string;

  @Expose()
  @IsOptional()
  @IsJsonObject()
  readonly data?: JsonObject;

  @Expose()
  @IsString()
  @IsOptional()
  readonly description?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  public toDomain(type: PushNotificationTemplateType): IPushNotificationTemplateCreate {
    return {
      name: this.name,
      data: this.data,
      description: this.description,
      module: this.module,
      type,
      title: this.title,
      body: this.body,
      imageUrl: this.imageUrl ?? undefined,
    };
  }
}
