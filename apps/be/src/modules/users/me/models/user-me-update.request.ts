import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserMeUpdateRequest {
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
}
