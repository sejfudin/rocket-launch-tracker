import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class AdminUserMeResponse {
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
  @IsString({ each: true })
  readonly roles?: string[];

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
        type: 'string',
      },
    },
  })
  readonly aclRules?: Array<[string, string, unknown?, unknown?, unknown?, unknown?]> = [];

  constructor(data: AdminUserMeResponse) {
    Object.assign(this, data);
  }

  static fromDomain(data: IAdminUserMeResponse): AdminUserMeResponse {
    return new AdminUserMeResponse(data);
  }
}

export interface IAdminUserMeResponse extends AdminUserMeResponse {}
