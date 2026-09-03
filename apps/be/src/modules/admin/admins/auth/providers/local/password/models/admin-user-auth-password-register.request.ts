import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

import { AdminUserCreateRequest } from '~modules/admin/admins/user/models/admin-user-create.request';

export class AdminUserAuthPasswordRegisterRequest extends AdminUserCreateRequest {
  /**
   * Set password
   */
  @Expose()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty({ example: 'my-password' })
  readonly password!: string;
}
