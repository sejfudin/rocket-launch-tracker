import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

import {
  IPushNotificationTemplate,
  PushNotificationTemplateStatus,
  PushNotificationTemplateType,
} from './push-notification-template.types';

export class PushNotificationTemplateParamResponse {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsBoolean()
  required!: boolean;

  constructor(data: { name: string; required: boolean }) {
    Object.assign(this, data);
  }
}

export class PushNotificationTemplateResponse {
  @Expose()
  @IsString()
  readonly id!: string;

  @Expose()
  @IsString()
  readonly name!: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => PushNotificationTemplateParamResponse)
  @IsArray()
  @IsOptional({ each: true })
  readonly params?: PushNotificationTemplateParamResponse[];

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
  @IsJsonObject()
  @IsOptional()
  readonly data?: JsonObject;

  @Expose()
  @IsString()
  @IsOptional()
  readonly description?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  @Expose()
  @IsDate()
  @IsOptional()
  readonly createdAt?: Date;

  @Expose()
  @IsDate()
  @IsOptional()
  readonly updatedAt?: Date;

  @Expose()
  @IsEnum(PushNotificationTemplateType)
  @ApiPropertyOptional({ enum: PushNotificationTemplateType, enumName: 'PushNotificationTemplateType' })
  @IsOptional()
  readonly type?: PushNotificationTemplateType;

  @Expose()
  @IsEnum(PushNotificationTemplateStatus)
  @ApiPropertyOptional({ enum: PushNotificationTemplateStatus, enumName: 'PushNotificationTemplateStatus' })
  @IsOptional()
  readonly status?: PushNotificationTemplateStatus;

  constructor(data: PushNotificationTemplateResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IPushNotificationTemplate): PushNotificationTemplateResponse {
    return new PushNotificationTemplateResponse({
      id: data.name,
      name: data.name,
      params: data.params?.map((param) => new PushNotificationTemplateParamResponse(param)),
      title: data.title,
      body: data.body,
      imageUrl: data.imageUrl,
      data: data.data,
      module: data.module,
      description: data.description,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      type: data.type,
      status: data.status,
    });
  }
}
