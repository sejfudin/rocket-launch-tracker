import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max } from 'class-validator';

export enum PushNotificationLabelsField {
  ID = 'id',
  TOKEN = 'token',
  RESOURCENAME = 'resourceName',
}

export enum PushNotificationLabelsName {
  TITLE = 'title',
  RESOURCENAME = 'resourceName',
  RESOURCELABEL = 'resourceLabel',
  RESOURCELABEL_TITLE = 'resourceLabel-title',
}

export class PushNotificationLabelsRequest {
  @Expose()
  @IsEnum(PushNotificationLabelsField)
  @ApiProperty({ enum: PushNotificationLabelsField, enumName: 'PushNotificationLabelsField' })
  readonly field!: PushNotificationLabelsField;

  @Expose()
  @IsEnum(PushNotificationLabelsName)
  @ApiProperty({ enum: PushNotificationLabelsName, enumName: 'PushNotificationLabelsName' })
  readonly name!: PushNotificationLabelsName;

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(100)
  readonly limit?: number = 20;
}

export interface IPushNotificationLabelsRequest extends PushNotificationLabelsRequest {}
