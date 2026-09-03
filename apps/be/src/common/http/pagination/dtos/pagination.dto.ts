import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

import { IPagination } from '../pagination.types';

export class PaginationDto<T> implements IPagination<T> {
  /**
   * 1-indexed page number to begin from
   */
  @Expose()
  @IsNumber()
  @IsOptional()
  readonly page?: number;

  /**
   * ID of item to start after
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly cursor?: string;

  /**
   * Cursor for next set of items
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly nextCursor?: string;

  /**
   * Items per response
   */
  @Expose()
  @IsNumber()
  readonly limit!: number;

  /**
   * Items
   */
  @ApiProperty({ description: 'Items' })
  @ValidateNested({ each: true })
  @Expose()
  readonly items!: T[];

  /**
   * Total available items
   */
  @Expose()
  @IsNumber()
  readonly totalItems!: number;

  constructor(data: IPagination<T>) {
    Object.assign(this, data);
  }

  static fromDomain<D, T>(data: IPagination<D>, itemMapper?: (item: D) => T): PaginationDto<T> {
    return new PaginationDto<T>({
      page: data.page,
      cursor: data.cursor,
      nextCursor: data.nextCursor,
      limit: data.limit,
      items: itemMapper ? data.items.map(itemMapper) : (data.items as unknown as T[]),
      totalItems: data.totalItems,
    });
  }
}
