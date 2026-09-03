import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { EmailCompilerType } from './email-compiler.types';
import { EmailTemplateStatus, EmailTemplateType, IEmailTemplate } from './email-template.types';

export class EmailTemplateParamResponse {
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

export class EmailTemplateResponse implements IEmailTemplate {
  @Expose()
  @IsString()
  readonly id!: string;

  @Expose()
  @IsString()
  readonly name!: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => EmailTemplateParamResponse)
  @IsArray()
  @IsOptional({ each: true })
  readonly params?: EmailTemplateParamResponse[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly from?: string;

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  readonly cc?: string[];

  @Expose()
  @IsString({ each: true })
  @IsOptional()
  readonly bcc?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly description?: string;

  @Expose()
  @IsString()
  @ApiProperty({
    enum: EmailCompilerType,
    enumName: 'EmailCompilerType',
  })
  readonly engine!: EmailCompilerType;

  @Expose()
  @IsString()
  @IsOptional()
  readonly externalTemplate?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly html?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly text?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly subject?: string;

  @Expose()
  @IsEnum(EmailTemplateType)
  @IsOptional()
  @ApiPropertyOptional({ enum: EmailTemplateType, enumName: 'EmailTemplateType' })
  readonly type?: EmailTemplateType;

  @Expose()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly updatedAt?: Date;

  @Expose()
  @IsEnum(EmailTemplateStatus)
  @ApiPropertyOptional({ enum: EmailTemplateStatus, enumName: 'EmailTemplateStatus' })
  @IsOptional()
  readonly status?: EmailTemplateStatus;

  constructor(data: EmailTemplateResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IEmailTemplate): EmailTemplateResponse {
    return new EmailTemplateResponse({
      ...data,
      externalTemplate: data.engineOptions?.externalTemplate,
      params: data.params?.map((param) => new EmailTemplateParamResponse(param)),
      id: data.name,
    });
  }
}
