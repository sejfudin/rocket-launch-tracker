import { Expose, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

import type { JsonObject } from '~common/types';
import { IsJsonObject } from '~common/validate';

export class MediaAdminResponse {
  /**
   * Media Id
   */
  @Expose()
  @IsString()
  readonly id!: string;

  /**
   * Resource name
   */
  @Expose()
  @IsString()
  readonly resourceName!: string;

  /**
   * File name
   */
  @Expose()
  @IsString()
  readonly fileName!: string;

  /**
   * File size in bytes
   */
  @Expose()
  @IsNumber()
  readonly fileSize!: number;

  /**
   * Mime type of the file
   */
  @Expose()
  @IsString()
  readonly mimeType!: string;

  /**
   * Provider key/id
   */
  @Expose()
  @IsString()
  readonly key!: string;

  /**
   * Media provider
   */
  @Expose()
  @IsString()
  readonly provider!: string;

  /**
   * Additional specific meta data
   */
  @Expose()
  @IsJsonObject()
  @IsOptional()
  readonly meta?: JsonObject;

  /**
   * If the file was uploaded
   */
  @Expose()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly uploaded?: Date;

  /**
   * If the file was validated
   */
  @Expose()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly validated?: Date;

  /**
   * If the file was deleted
   */
  @Expose()
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  readonly deleted?: Date;

  /**
   * Module that owns this media
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  /**
   * Module scoped type of this file
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly type?: string;

  /**
   * Resource Id
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly resourceId?: string;

  /**
   * User that uploaded the image
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly userId?: string;

  /**
   * URL to access the media
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly url?: string;

  /**
   * Created date of the media
   */
  @Expose()
  @IsDate()
  @Type(() => Date)
  readonly createdAt!: Date;

  constructor(data: IMediaAdminResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IMediaAdminResponse): MediaAdminResponse {
    return new MediaAdminResponse(data);
  }
}

export interface IMediaAdminResponse extends MediaAdminResponse {}
