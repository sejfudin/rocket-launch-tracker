import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

import { EmailCompilerType } from './email-compiler.types';
import { EmailTemplateType } from './email-template.types';

export enum EmailTemplatePaginationOrderField {
  name = 'name',
  engine = 'engine',
  type = 'type',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export class EmailTemplateFilterDto {
  @Expose()
  @TransformInputToArray()
  @IsString({ each: true })
  @IsOptional()
  readonly names?: string[];

  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  @Expose()
  @IsEnum(EmailCompilerType)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Filter by engine type', enum: EmailCompilerType, enumName: 'EmailCompilerType' })
  readonly engine?: string;

  @Expose()
  @IsEnum(EmailTemplateType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by template type',
    enum: EmailTemplateType,
    enumName: 'EmailTemplateType',
  })
  readonly type?: EmailTemplateType;

  @Expose()
  @Type(() => DateRangeDto)
  @IsOptional()
  @ValidateNested()
  readonly updatedAt?: DateRangeDto;
}

export interface IEmailTemplateFilter extends EmailTemplateFilterDto {}

export class EmailTemplatePaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<EmailTemplateFilterDto, EmailTemplatePaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(EmailTemplatePaginationOrderField)
  readonly order?: IPaginationOrder<EmailTemplatePaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(EmailTemplateFilterDto)
  readonly filter?: EmailTemplateFilterDto;
}

export interface IEmailTemplatePaginationQuery extends EmailTemplatePaginationQueryDto {}
