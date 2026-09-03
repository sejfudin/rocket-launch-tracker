import { Expose } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

import { IUser } from '~modules/users/user/models';

export class UserAdminResponse {
  /**
   * Id
   */
  @Expose()
  @IsString()
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
   * Roles
   */
  @Expose()
  @IsString({ each: true })
  readonly roles!: string[];

  /**
   * Created at
   */
  @Expose()
  @IsDate()
  readonly createdAt!: Date;

  /**
   * Updated at
   */
  @Expose()
  @IsDate()
  readonly updatedAt!: Date;

  constructor(data: IUserResponse) {
    Object.assign(this, data);
  }

  static fromDomain(user: IUser): UserAdminResponse {
    return new UserAdminResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}

export interface IUserResponse extends UserAdminResponse {}
