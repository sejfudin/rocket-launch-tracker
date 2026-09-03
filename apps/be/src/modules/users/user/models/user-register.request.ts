import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserRegisterRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name!: string;

  /**
   * Email
   */
  @Expose()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  readonly email!: string;
}
