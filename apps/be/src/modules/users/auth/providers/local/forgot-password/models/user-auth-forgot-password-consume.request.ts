import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { UserAuthPasswordChangeRequest } from '~modules/users/auth/providers/local/password/models/user-auth-password-change.request';

export class UserAuthForgotPasswordConsumeRequest extends UserAuthPasswordChangeRequest {
  /**
   * Code received by the user for password reset
   */
  @Expose()
  @IsString()
  readonly code!: string;
}
