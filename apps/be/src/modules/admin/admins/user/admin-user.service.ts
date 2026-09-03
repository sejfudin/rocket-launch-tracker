import { Injectable } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import { AdminUserRepository } from './admin-user.repository';
import { IAdminUser, IAdminUserCreate, IAdminUserPaginationQuery, IAdminUserUpdate } from './models/admin-user.types';

@Injectable()
export class AdminUserService {
  constructor(private readonly userRepository: AdminUserRepository) {}

  async paginate(query: IAdminUserPaginationQuery, tx?: Transaction): Promise<IPagination<IAdminUser>> {
    return await this.userRepository.paginate(query, tx);
  }

  async find(where: { id: string }, tx?: Transaction): Promise<IAdminUser | null> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const user = await this.userRepository.find(where, tx);
    if (!user) {
      return null;
    }
    return await this.userRepository.find(where, tx);
  }

  async create(data: IAdminUserCreate, tx?: Transaction): Promise<IAdminUser> {
    return await this.userRepository.create(data, tx);
  }

  async delete(data: { id: string }, tx?: Transaction): Promise<void> {
    return await this.userRepository.delete(data, tx);
  }

  async update(where: { id: string }, data: IAdminUserUpdate, tx?: Transaction): Promise<IAdminUser> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const user = await this.find(where, tx);
    if (!user) {
      throw new BadRequestException('AdminUser not found');
    }
    return await this.userRepository.update(where, data, tx);
  }
}
