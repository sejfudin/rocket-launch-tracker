import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

import { DateRangeDto } from '~common/http/dtos/date-range.dto';
import { IPaginationOrder, PaginationFilter, PaginationOrder, PaginationQueryDto } from '~common/http/pagination';
import { IMediaFileSizeRange, IMediaFilter, IMediaPaginationQuery, MediaOrderField } from '~common/media/models';

class MediaFileSizeRangeDto implements IMediaFileSizeRange {
  /**
   * Minimum file size in bytes
   */
  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  readonly minSize?: number;

  /**
   * Maximum file size in bytes
   */
  @Expose()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  readonly maxSize?: number;
}

class MediaAdminPaginationFilterDto implements IMediaFilter {
  /**
   * Module
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  /**
   * Type
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly type?: string;

  /**
   * Search
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  /**
   * Multiple file size ranges filter
   */
  @Expose()
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MediaFileSizeRangeDto)
  @ApiPropertyOptional({
    type: [MediaFileSizeRangeDto],
    description: 'Array of file size ranges to filter by',
  })
  readonly fileSizeRanges?: MediaFileSizeRangeDto[];

  /**
   * User ID who uploaded the file
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly userId?: string;

  /**
   * Date range filter for creation date
   */
  @Expose()
  @Type(() => DateRangeDto)
  @IsOptional()
  @ApiPropertyOptional({ type: DateRangeDto })
  @ValidateNested()
  readonly createdAt?: DateRangeDto;

  /**
   * Multiple MIME types filter
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly mimeTypes?: string[];

  /**
   * If the file was uploaded
   */
  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly uploaded?: boolean;

  /**
   * If the file was validated
   */
  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly validated?: boolean;
}

export class MediaAdminPaginationQueryDto extends PaginationQueryDto implements IMediaPaginationQuery {
  @Expose()
  @IsOptional()
  @PaginationOrder(MediaOrderField)
  readonly order?: IPaginationOrder<MediaOrderField>[];

  @Expose()
  @IsOptional()
  @PaginationFilter(MediaAdminPaginationFilterDto)
  readonly filter?: MediaAdminPaginationFilterDto;
}
