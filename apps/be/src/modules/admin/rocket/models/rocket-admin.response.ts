import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { MediaFetchInstructionsResponse } from '~common/media/models';

import { type IRocket, RocketStatusType } from '~modules/rocket/models/rocket.types';

export class RocketAdminResponse {
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
   * Model ID
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  readonly modelId?: string;

  /**
   * Model name
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly model!: string;

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
   * Owner ID
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  readonly ownerId?: string;

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

  constructor(data: IRocketAdminResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IRocket): RocketAdminResponse {
    return new RocketAdminResponse({
      ...data,
      model: data.model?.name ?? '',
      picture: data.picture ? new MediaFetchInstructionsResponse(data.picture) : undefined,
      timelapses: data.timelapses ? data.timelapses.map((t) => new MediaFetchInstructionsResponse(t)) : undefined,
    });
  }
}

export interface IRocketAdminResponse extends RocketAdminResponse {}
