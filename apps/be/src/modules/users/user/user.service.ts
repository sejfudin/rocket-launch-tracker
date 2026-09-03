import { Injectable } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';

import { Transaction } from '~database/types';

import { IUser, IUserCreate, IUserPaginationFilter, IUserPaginationQuery, IUserUpdate } from './models';
import { UserLabelsRequest } from './models/user-labels.request';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async paginate(query: IUserPaginationQuery, tx?: Transaction): Promise<IPagination<IUser>> {
    return await this.userRepository.paginate(query, tx);
  }

  async list(where: IUserPaginationFilter, tx?: Transaction): Promise<IUser[]> {
    return await this.userRepository.list(where, tx);
  }

  async find(where: { id: string }, tx?: Transaction): Promise<IUser | null> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    return await this.userRepository.find(where, tx);
  }

  async create(data: IUserCreate, tx?: Transaction): Promise<IUser> {
    return await this.userRepository.create(data, tx);
  }

  async update(where: { id: string }, data: IUserUpdate, tx?: Transaction): Promise<IUser> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const user = await this.find(where, tx);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return await this.userRepository.update(where, data, tx);
  }

  async delete(data: { id: string }, tx?: Transaction): Promise<void> {
    return await this.userRepository.delete(data, tx);
  }

  async listLabels(query: UserLabelsRequest): Promise<{ id: string; label: string }[]> {
    return await this.userRepository.listLabels(query);
  }
}
