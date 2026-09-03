import { Expose } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

import { IRocketModel } from '~modules/rocket/models/rocket-model.types';

export class RocketModelAdminResponse {
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
   * Organization
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly organization?: string;

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

  constructor(data: IRocketModelAdminResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IRocketModel): RocketModelAdminResponse {
    return new RocketModelAdminResponse({
      id: data.id,
      name: data.name,
      organization: data.organization,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

export interface IRocketModelAdminResponse extends RocketModelAdminResponse {}
