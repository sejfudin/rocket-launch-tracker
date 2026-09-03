import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { AdminUserAuthPasswordChangeRequest } from '~modules/admin/admins/auth/providers/local/password/models/admin-user-auth-password-change.request';

export class AdminUserAuthForgotPasswordConsumeRequest extends AdminUserAuthPasswordChangeRequest {
  /**
   * Code received by the user for password reset
   */
  @Expose()
  @IsString()
  readonly code!: string;
}
