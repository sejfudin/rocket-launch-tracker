import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class RocketModelAdminUpdateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * Organization
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly organization?: string;
}
