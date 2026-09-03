import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max } from 'class-validator';

import { EmailTemplateType } from './email-template.types';

export class EmailTemplateLabelsRequest {
  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Expose()
  @IsEnum(EmailTemplateType)
  @ApiProperty({ enum: EmailTemplateType, enumName: 'EmailTemplateType' })
  readonly type!: EmailTemplateType;

  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(100)
  readonly limit?: number = 20;

  @Expose()
  @IsString()
  @IsOptional()
  readonly omit?: string[];
}

export interface IEmailTemplateLabelsRequest extends EmailTemplateLabelsRequest {}
