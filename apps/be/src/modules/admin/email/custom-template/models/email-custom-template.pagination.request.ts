import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { EmailCompilerType } from '~common/email/models/email-compiler.types';
import { EmailTemplatePaginationOrderField } from '~common/email/models/email-template.pagination.request';
import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

export class EmailCustomTemplateFilterDto {
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
  @Type(() => DateRangeDto)
  @IsOptional()
  @ValidateNested()
  readonly updatedAt?: DateRangeDto;
}

export class EmailCustomTemplatePaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<EmailCustomTemplateFilterDto, EmailTemplatePaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(EmailTemplatePaginationOrderField)
  readonly order?: IPaginationOrder<EmailTemplatePaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(EmailCustomTemplateFilterDto)
  readonly filter?: EmailCustomTemplateFilterDto;
}

export interface IEmailCustomTemplatePaginationQuery extends EmailCustomTemplatePaginationQueryDto {}
