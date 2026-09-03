import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max } from 'class-validator';

export class LabelQueryDto {
  /**
   * Search query to filter labels by name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly search?: string;

  @Expose()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Max(100)
  readonly limit?: number = 20;
}

export interface ILabelQuery extends LabelQueryDto {}
