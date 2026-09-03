import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { AdminUserAuthPasswordRegisterRequest } from '~modules/admin/admins/auth/providers/local/password/models/admin-user-auth-password-register.request';

export class AdminUserAuthPasswordAndSecretRegisterRequest extends AdminUserAuthPasswordRegisterRequest {
  @ApiProperty({ example: 'random-secret' })
  @Expose()
  @IsString()
  readonly secret!: string;
}
