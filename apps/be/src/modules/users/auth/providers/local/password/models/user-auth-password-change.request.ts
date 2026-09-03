import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserAuthPasswordChangeRequest {
  /**
   * Set new password
   */
  @Expose()
  @IsString()
  @MinLength(12)
  @IsNotEmpty()
  readonly password!: string;
}
