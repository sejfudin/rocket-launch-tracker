import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';

import type { IMediaAttachRequest } from './media.types';

export class MediaAttachRequest implements IMediaAttachRequest {
  /**
   * Media Id
   */
  @Expose()
  @IsUUID('all')
  readonly id!: string;
}
