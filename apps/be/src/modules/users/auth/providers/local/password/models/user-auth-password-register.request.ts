import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { UserRegisterRequest } from '~modules/users/user/models/user-register.request';

export class UserAuthPasswordRegisterRequest extends UserRegisterRequest {
  /**
   * Set password
   */
  @Expose()
  @IsString()
  @MinLength(12)
  @IsNotEmpty()
  readonly password!: string;
}
