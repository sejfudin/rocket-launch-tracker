import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminUserAuthPasswordLoginRequest {
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
  @ApiProperty({ example: 'my-password' })
  readonly password!: string;
}
