import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { IUser, UserRole } from '~modules/users/user';

export class UserMeResponse {
  /**
   * User ID
   */
  @Expose()
  @IsUUID('all')
  readonly id!: string;

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
  readonly email?: string;

  /**
   * User Roles
   */
  @Expose()
  @IsEnum(UserRole, { each: true })
  @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
  readonly roles!: UserRole[];

  /**
   * User ACL
   */
  @Expose()
  @IsArray({ each: true })
  @ApiProperty({
    type: 'array',
    items: {
      type: 'array',
      items: {
        oneOf: [{ type: 'string' }, { type: 'object' }, { type: 'array' }, { type: 'boolean' }],
      },
    },
  })
  readonly aclRules?: Array<[string, string, unknown?, unknown?, unknown?, unknown?]> = [];

  constructor(data: IUserAccountResponse) {
    Object.assign(this, data);
  }

  static fromDomain(
    data: IUser & { aclRules?: Array<[string, string, unknown?, unknown?, unknown?, unknown?]> },
  ): UserMeResponse {
    return new UserMeResponse(data);
  }
}

export interface IUserAccountResponse extends UserMeResponse {}
