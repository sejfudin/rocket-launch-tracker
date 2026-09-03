import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

import { ApiField } from '~common/http/openapi';
import { MediaAttachRequest } from '~common/media';

import { API_ROCKET_LIST_MODELS } from '~modules/rocket/models/rocket.constants';
import { RocketType } from './rocket.types';

export class RocketUpdateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * Model ID (legacy field, optional)
   */
  @Expose()
  @IsUUID('all')
  @ApiField({ type: 'reference-input', reference: API_ROCKET_LIST_MODELS })
  @IsOptional()
  readonly modelId?: string;

  /**
   * Height in meters
   */
  @Expose()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  readonly height?: number;

  /**
   * Weight in kg
   */
  @Expose()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  readonly weight?: number;

  /**
   * Scheduled launch date/time
   */
  @Expose()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly launchDatetime?: Date;

  /**
   * Rocket type: 'commercial' or 'space_exploration'
   */
  @Expose()
  @IsEnum(RocketType)
  @ApiPropertyOptional({ enum: RocketType, enumName: 'RocketType' })
  @IsOptional()
  readonly rocketType?: RocketType;

  /**
   * Passengers (for commercial rockets)
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly passengers?: string[];

  /**
   * Crew members (for space exploration rockets, exactly 3)
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly crew?: string[];

  /**
   * Picture
   */
  @Expose()
  @ValidateNested()
  @Type(() => MediaAttachRequest)
  @IsOptional()
  readonly picture?: MediaAttachRequest;

  /**
   * Time-lapse images
   */
  @Expose()
  @Type(() => MediaAttachRequest)
  @ValidateNested({ each: true })
  @IsOptional()
  readonly timelapses?: MediaAttachRequest[];
}
