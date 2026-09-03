import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserAuthPasswordLoginRequest {
  /**
   * Email
   */
  @Expose()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase().trim())
  readonly email!: string;

  /**
   * Password
   */
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly password!: string;
}
