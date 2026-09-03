import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RocketAdminCreateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name!: string;

  /**
   * Model ID
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  readonly modelId!: string;

  /**
   * Owner ID
   */
  @Expose()
  @IsUUID('all')
  @IsOptional()
  readonly ownerId?: string;
}
