import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

import { IDateRange } from '~common/http/interfaces/date-range.interface';

export class DateRangeDto implements IDateRange {
  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  readonly start?: Date;

  @Expose()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  readonly end?: Date;
}
