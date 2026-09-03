import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import {
  ActivityPaginationBaseFilterDto,
  ActivityPaginationFilterDto,
  ActivityPaginationOrderField,
} from '~common/activities/models/activity-pagination.request';
import { EmailLogEvent } from '~common/email/models/email-log.types';
import {
  IPaginationOrder,
  IPaginationQuery,
  PaginationFilter,
  PaginationOrder,
  PaginationQueryDto,
} from '~common/http/pagination';

class EmailActivityPaginationFilterDto extends ActivityPaginationBaseFilterDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly templateName?: string;

  @Expose()
  @IsString()
  @IsOptional()
  readonly provider?: string;

  @Expose()
  @IsEnum(EmailLogEvent)
  @IsOptional()
  @ApiPropertyOptional({ enum: EmailLogEvent, enumName: 'EmailLogEvent' })
  readonly event?: EmailLogEvent;
}

export class EmailActivityAdminPaginationQueryDto
  extends PaginationQueryDto
  implements IPaginationQuery<ActivityPaginationFilterDto, ActivityPaginationOrderField>
{
  @Expose()
  @IsOptional()
  @PaginationOrder(ActivityPaginationOrderField)
  readonly order?: IPaginationOrder<ActivityPaginationOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(EmailActivityPaginationFilterDto)
  readonly filter?: EmailActivityPaginationFilterDto;
}
