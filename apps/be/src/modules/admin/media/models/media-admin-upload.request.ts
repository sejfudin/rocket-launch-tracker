import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { MediaUploadRequest } from '~common/media';

export class MediaAdminUploadRequest extends MediaUploadRequest {
  /**
   * Upload type
   */
  @Expose()
  @IsString()
  declare readonly resourceName: string;

  /**
   * Upload type
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly type?: string;

  /**
   * Upload module
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly module?: string;

  /**
   * Upload resourceId
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly resourceId?: string;
}

export interface IMediaAdminUploadRequest extends MediaAdminUploadRequest {}
