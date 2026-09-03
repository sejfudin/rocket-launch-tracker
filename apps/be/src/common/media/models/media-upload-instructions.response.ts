import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Allow, IsOptional, IsString } from 'class-validator';

import type { IMediaUploadInstructions } from '~common/media';

export class MediaUploadInstructionsResponse {
  /**
   * Method to upload with - PUT, POST, or custom instructions
   */
  @Expose()
  @IsOptional()
  @IsString()
  readonly method?: string;

  /**
   * Url to upload to
   */
  @Expose()
  @IsOptional()
  @IsString()
  readonly url?: string;

  /**
   * Additional fields for the POST upload
   */
  @Expose()
  @IsOptional()
  @Allow()
  @ApiPropertyOptional({
    description: 'Additional form fields to include in the POST upload request. Each item is a [key, value] pair.',
    type: 'array',
    items: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
    },
    example: [['Content-Type', 'image/png']],
  })
  readonly fields?: Array<[string, string]>;

  /**
   * Media ID
   */
  @Expose()
  @IsOptional()
  @IsString()
  readonly id?: string;

  constructor(data: MediaUploadInstructionsResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IMediaUploadInstructions) {
    return new MediaUploadInstructionsResponse(data);
  }
}
