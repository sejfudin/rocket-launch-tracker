import { Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

import { IUser } from './user.types';

export class UserResponse {
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

  constructor(data: IUserResponse) {
    Object.assign(this, data);
  }

  static fromDomain(user: IUser): UserResponse {
    return new UserResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
    });
  }
}

export interface IUserResponse extends UserResponse {}
