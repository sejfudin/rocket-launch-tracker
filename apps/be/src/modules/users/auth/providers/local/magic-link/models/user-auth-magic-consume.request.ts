import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class UserAuthMagicConsumeRequest {
  /**
   * Code received by the user for password reset
   */
  @Expose()
  @IsString()
  readonly code!: string;
}
