import { Expose, Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class UserAuthEmailGenerateRequest {
  /**
   * Email address of the user requesting the nonce
   */
  @Expose()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  readonly email!: string;
}
