import { Injectable } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';

import { UserService } from '~modules/users/user/user.service';

import { UserMeResponse, UserMeUpdateRequest } from './models';

@Injectable()
export class UserMeService {
  constructor(private readonly userService: UserService) {}

  /**
   * Get User Account
   */
  async get(where: { id: string }): Promise<UserMeResponse> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const user = await this.userService.find(where);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return UserMeResponse.fromDomain(user);
  }

  /**
   * Update User Account Fields
   */
  async update(where: { id: string }, data: UserMeUpdateRequest): Promise<UserMeResponse> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const user = await this.userService.update(where, { name: data.name, email: data.email });
    return UserMeResponse.fromDomain(user);
  }
}
