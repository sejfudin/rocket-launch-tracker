import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { ApiField } from '~common/http/openapi';
import { MediaAttachRequest } from '~common/media';

import { API_ROCKET_LIST_MODELS } from '~modules/rocket/models/rocket.constants';
import { RocketStatusType } from '~modules/rocket/models/rocket.types';

export class RocketAdminUpdateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * Model ID
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  @ApiField({ type: 'reference-input', reference: API_ROCKET_LIST_MODELS })
  readonly modelId?: string;

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

  /**
   * Status
   */
  @Expose()
  @IsEnum(RocketStatusType)
  @IsOptional()
  @ApiPropertyOptional({ enum: RocketStatusType, enumName: 'RocketStatusType' })
  readonly status?: RocketStatusType;

  /**
   * Owner ID
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  readonly ownerId?: string;
}
