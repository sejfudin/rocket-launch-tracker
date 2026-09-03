import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class AdminUserCreateRequest {
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
  @Transform(({ value }) => value?.toLowerCase().trim())
  readonly email!: string;

  /**
   * Roles
   */
  @Expose()
  @IsString({ each: true })
  @ApiProperty({ example: ['general-manager'] })
  readonly roles!: string[];
}
