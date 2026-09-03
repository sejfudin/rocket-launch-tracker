import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { IRocketModel } from './rocket.types';

export class RocketModelResponse implements IRocketModel {
  /**
   * ID
   */
  @Expose()
  @IsString()
  readonly id!: string;

  /**
   * Name
   */
  @Expose()
  @IsString()
  readonly name!: string;

  /**
   * Organization
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly organization?: string;

  constructor(data: IRocketModelResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IRocketModelResponse): RocketModelResponse {
    return new RocketModelResponse(data);
  }
}

export interface IRocketModelResponse extends RocketModelResponse {}
