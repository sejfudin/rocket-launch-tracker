import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AdminUserUpdateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * Email
   */
  @Expose()
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  readonly email?: string;

  /**
   * User Roles
   */
  @Expose()
  @IsString({ each: true })
  readonly roles!: string[];
}
