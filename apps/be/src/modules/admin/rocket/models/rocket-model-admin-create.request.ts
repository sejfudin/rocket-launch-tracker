import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class RocketModelAdminCreateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  readonly name!: string;

  /**
   * Organization
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly organization?: string;
}
