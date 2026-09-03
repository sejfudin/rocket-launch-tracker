import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import type { IMediaFetchInstructions } from './media.types';

export class MediaFetchInstructionsResponse implements IMediaFetchInstructions {
  /**
   * Url to media
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly url?: string;

  /**
   * Media Id
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly id?: string;

  constructor(data: MediaFetchInstructionsResponse) {
    Object.assign(this, data);
  }
}

export interface IMediaFetchInstructionsResponse extends IMediaFetchInstructions {}
