import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class AdminUserAdminBulkDeleteRequest {
  /**
   * Selected ids of admin users to delete
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  readonly ids!: string[];
}
