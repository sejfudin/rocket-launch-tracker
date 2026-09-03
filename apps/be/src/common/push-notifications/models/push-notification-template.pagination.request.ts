import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { TransformInputToArray } from '~common/validate';

import { PushNotificationTemplateType } from './push-notification-template.types';

export enum PushNotificationTemplatePaginationOrderField {
  name = 'name',
  module = 'module',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export class PushNotificationTemplateFilterDto {
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
  @IsString()
  @IsOptional()
  readonly title?: string;

  @Expose()
  @IsEnum(PushNotificationTemplateType)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Filter by template type',
    enum: PushNotificationTemplateType,
    enumName: 'PushNotificationTemplateType',
  })
  readonly type?: PushNotificationTemplateType;
}

export interface IPushNotificationTemplateFilter extends PushNotificationTemplateFilterDto {}

export class PushNotificationTemplatePaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<PushNotificationTemplateFilterDto, PushNotificationTemplatePaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(PushNotificationTemplatePaginationOrderField)
  readonly order?: IPaginationOrder<PushNotificationTemplatePaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(PushNotificationTemplateFilterDto)
  readonly filter?: PushNotificationTemplateFilterDto;
}

export interface IPushNotificationTemplatePaginationQuery extends PushNotificationTemplatePaginationQueryDto {}
