import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';

import { EmailCompilerType } from '~common/email/models/email-compiler.types';
import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray, TransformInputToBoolean } from '~common/validate';

export enum EmailSystemTemplatePaginationOrderField {
  name = 'name',
  engine = 'engine',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export class EmailSystemTemplateFilterDto {
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
  @IsEnum(EmailCompilerType)
  @IsOptional()
  @ApiPropertyOptional({ description: 'Filter by engine type', enum: EmailCompilerType, enumName: 'EmailCompilerType' })
  readonly engine?: string;

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  @IsOptional()
  readonly isCustomized?: boolean;

  @Expose()
  @Type(() => DateRangeDto)
  @IsOptional()
  @ValidateNested()
  readonly updatedAt?: DateRangeDto;
}

export class EmailSystemTemplatePaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<EmailSystemTemplateFilterDto, EmailSystemTemplatePaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(EmailSystemTemplatePaginationOrderField)
  readonly order?: IPaginationOrder<EmailSystemTemplatePaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(EmailSystemTemplateFilterDto)
  readonly filter?: EmailSystemTemplateFilterDto;
}

export interface IEmailSystemTemplatePaginationQuery extends EmailSystemTemplatePaginationQueryDto {}
