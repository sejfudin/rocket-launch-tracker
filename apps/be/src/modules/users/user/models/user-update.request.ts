import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { UserRole } from '../user.constants';

export class UserUpdateRequest {
  /**
   * Name
   */
  @Expose()
  @IsString()
  @IsOptional()
  readonly name?: string;

  /**
   * Email
   */
  @Expose()
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  readonly email?: string;

  /**
   * User Roles
   */
  @Expose()
  @IsEnum(UserRole, { each: true })
  @ApiProperty({ enum: UserRole, enumName: 'UserRole', isArray: true, description: 'User roles' })
  readonly roles!: UserRole[];
}
