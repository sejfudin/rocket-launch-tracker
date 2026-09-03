import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class UserAdminBulkDeleteRequest {
  /**
   * Selected ids of users to delete
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  readonly ids!: string[];
}
