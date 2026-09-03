import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

import { IPushNotificationTemplateUpdate } from './push-notification-template.types';

export class PushNotificationTemplateUpdateRequest {
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

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

  constructor(data: PushNotificationTemplateUpdateRequest) {
    Object.assign(this, data);
  }

  public toDomain(): IPushNotificationTemplateUpdate {
    return {
      name: this.name,
      module: this.module,
      description: this.description,
      data: this.data,
      title: this.title,
      body: this.body,
      imageUrl: this.imageUrl,
    };
  }
}
