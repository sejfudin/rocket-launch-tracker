import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { MediaFetchInstructionsResponse } from '~common/media';

import { type IRocket, RocketStatusType, RocketType } from './rocket.types';

export class RocketResponse {
  /**
   * ID
   */
  @Expose()
  @IsUUID('all')
  readonly id!: string;

  /**
   * Name
   */
  @Expose()
  @IsString()
  readonly name!: string;

  /**
   * Model ID (legacy field)
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  readonly modelId?: string;

  /**
   * Model name (legacy field)
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly model?: string;

  /**
   * Height in meters
   */
  @Expose()
  @IsNumber()
  @IsOptional()
  readonly height?: number;

  /**
   * Weight in kg
   */
  @Expose()
  @IsNumber()
  @IsOptional()
  readonly weight?: number;

  /**
   * Scheduled launch date/time
   */
  @Expose()
  @IsDate()
  @IsOptional()
  readonly launchDatetime?: Date;

  /**
   * Rocket type
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
   * Crew members (for space exploration rockets)
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
  @Type(() => MediaFetchInstructionsResponse)
  @ValidateNested()
  @IsOptional()
  readonly picture?: MediaFetchInstructionsResponse;

  /**
   * Time-lapse images
   */
  @Expose()
  @Type(() => MediaFetchInstructionsResponse)
  @ValidateNested({ each: true })
  @IsOptional()
  readonly timelapses?: MediaFetchInstructionsResponse[];

  /**
   * Status
   */
  @Expose()
  @IsEnum(RocketStatusType)
  @ApiProperty({ enum: RocketStatusType, enumName: 'RocketStatusType' })
  readonly status!: RocketStatusType;

  /**
   * Created date
   */
  @Expose()
  @IsDate()
  readonly createdAt!: Date;

  /**
   * Updated date
   */
  @Expose()
  @IsDate()
  readonly updatedAt!: Date;

  constructor(data: RocketResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IRocket): RocketResponse {
    return new RocketResponse({
      ...data,
      model: data.model?.name,
      picture: data.picture ? new MediaFetchInstructionsResponse(data.picture) : undefined,
      timelapses: data.timelapses ? data.timelapses.map((t) => new MediaFetchInstructionsResponse(t)) : undefined,
    });
  }
}
