import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class MediaAdminBulkDeleteRequest {
  /**
   * Selected ids of media to delete
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  readonly ids!: string[];
}
