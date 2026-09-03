import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateIf } from 'class-validator';

import { IsEmailWithOptionalName } from '~common/email/validators';

import { EmailCompilerType } from './email-compiler.types';
import { IEmailTemplateUpdate } from './email-template.types';

export class EmailTemplateUpdateRequest implements IEmailTemplateUpdate {
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @Expose()
  @IsString()
  @ApiProperty({
    enum: EmailCompilerType,
    enumName: 'EmailCompilerType',
  })
  readonly engine!: EmailCompilerType;

  @Expose()
  @IsString()
  @ValidateIf((o: EmailTemplateUpdateRequest) => o.engine === EmailCompilerType.EXTERNAL)
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
  @IsString()
  @IsOptional()
  readonly module?: string;

  @Expose()
  @IsEmailWithOptionalName()
  @IsOptional()
  readonly from?: string;

  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  @IsOptional()
  readonly cc?: string[];

  @Expose()
  @IsArray()
  @IsEmailWithOptionalName({ each: true })
  @IsOptional()
  readonly bcc?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly description?: string;

  constructor(data: EmailTemplateUpdateRequest) {
    Object.assign(this, data);
  }

  public toDomain(): IEmailTemplateUpdate {
    return {
      cc: this.cc,
      bcc: this.bcc,
      from: this.from,
      html: this.html,
      text: this.text,
      subject: this.subject,
      module: this.module,
      description: this.description,
      name: this.name,
      engine: this.engine,
      engineOptions: this.externalTemplate
        ? {
            externalTemplate: this.externalTemplate,
          }
        : undefined,
    };
  }
}
