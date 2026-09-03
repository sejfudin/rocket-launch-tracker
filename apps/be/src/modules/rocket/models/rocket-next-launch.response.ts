import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsBoolean, IsOptional, ValidateNested } from 'class-validator';

import { type IRocket } from './rocket.types';
import { RocketResponse } from './rocket.response';

export class RocketNextLaunchResponse {
  /**
   * Whether there is a next launch scheduled
   */
  @Expose()
  @IsBoolean()
  @ApiProperty({ description: 'Whether there is a next launch scheduled' })
  readonly hasNextLaunch!: boolean;

  /**
   * Next rocket launch (if available)
   */
  @Expose()
  @Type(() => RocketResponse)
  @ValidateNested()
  @IsOptional()
  @ApiPropertyOptional({ type: RocketResponse, description: 'Next rocket launch details' })
  readonly nextLaunch?: RocketResponse;

  constructor(data: RocketNextLaunchResponse) {
    Object.assign(this, data);
  }

  static fromDomain(rocket: IRocket | null): RocketNextLaunchResponse {
    if (!rocket) {
      return new RocketNextLaunchResponse({
        hasNextLaunch: false,
      });
    }

    return new RocketNextLaunchResponse({
      hasNextLaunch: true,
      nextLaunch: RocketResponse.fromDomain(rocket),
    });
  }
}
