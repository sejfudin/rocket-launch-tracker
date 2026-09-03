import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max } from 'class-validator';

export enum MediaLabelsField {
  MIME_TYPE = 'mimeType',
  MODULE = 'module',
  TYPE = 'type',
}

export class MediaLabelsRequest {
  @Expose()
  @IsEnum(MediaLabelsField)
  @ApiProperty({ enum: MediaLabelsField, enumName: 'MediaLabelsField' })
  readonly field!: MediaLabelsField;

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Max(100)
  @Type(() => Number)
  readonly limit?: number = 20;
}

export interface IMediaLabelsRequest extends MediaLabelsRequest {}
