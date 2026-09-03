import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

import { IsEmailWithOptionalName } from '~common/email/validators';

import { EmailCompilerType } from './email-compiler.types';
import { EmailTemplateType, IEmailTemplateCreate } from './email-template.types';

export class EmailTemplateCreateRequest implements IEmailTemplateCreate {
  @Expose()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, {
    message: 'name must contain only lowercase letters, numbers, and dashes',
  })
  readonly name!: string;

  @Expose()
  @IsString()
  @IsEnum(EmailCompilerType)
  @ApiProperty({
    enum: EmailCompilerType,
    enumName: 'EmailCompilerType',
  })
  readonly engine!: EmailCompilerType;

  @Expose()
  @IsString()
  @ValidateIf((o: EmailTemplateCreateRequest) => o.engine === EmailCompilerType.EXTERNAL)
  @IsOptional()
  readonly externalTemplate?: string;

  @Expose()
  @IsString()
  @ValidateIf((o: EmailTemplateCreateRequest) => o.engine !== EmailCompilerType.EXTERNAL)
  readonly html?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly text?: string;

  @Expose()
  @IsString()
  @ValidateIf((o: EmailTemplateCreateRequest) => o.engine !== EmailCompilerType.EXTERNAL)
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

  public toDomain(type: EmailTemplateType): IEmailTemplateCreate {
    return {
      ...this,
      engineOptions: this.externalTemplate
        ? {
            externalTemplate: this.externalTemplate,
          }
        : undefined,
      type,
    };
  }
}
