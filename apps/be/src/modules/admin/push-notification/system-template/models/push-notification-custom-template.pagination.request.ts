import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';
import { PushNotificationTemplatePaginationOrderField } from '~common/push-notifications/models';
import { TransformInputToArray } from '~common/validate';

export class PushNotificationSystemTemplateFilterDto {
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
  readonly title?: string;
}

export class PushNotificationSystemTemplatePaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<PushNotificationSystemTemplateFilterDto, PushNotificationTemplatePaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(PushNotificationTemplatePaginationOrderField)
  readonly order?: IPaginationOrder<PushNotificationTemplatePaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(PushNotificationSystemTemplateFilterDto)
  readonly filter?: PushNotificationSystemTemplateFilterDto;
}

export interface IPushNotificationSystemTemplatePaginationQuery
  extends PushNotificationSystemTemplatePaginationQueryDto {}
