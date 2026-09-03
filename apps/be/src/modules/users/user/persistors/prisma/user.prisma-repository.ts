import { Injectable, ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma, User } from '~database/prisma/client';

import { IUserLabelsRequest, UserLabelsField, UserLabelsName } from '~modules/users/user/models/user-labels.request';
import { UserRole } from '~modules/users/user/user.constants';

import type { IUser, IUserCreate, IUserPaginationFilter, IUserPaginationQuery, IUserUpdate } from '../../models';
import { UserRepository } from '../../user.repository';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async paginate(query: IUserPaginationQuery, tx?: Prisma.TransactionClient): Promise<IPagination<IUser>> {
    const client = tx ?? this.prismaService.client;
    const where: Prisma.UserWhereInput = {};

    if (query.filter) {
      for (const key of Object.keys(query.filter)) {
        switch (key) {
          case 'ids':
            where.id = { in: query.filter.ids };
            break;
          case 'email':
            where.email = query.filter.email;
            break;
          case 'search':
            where.OR = query.filter.search
              ? [
                  { email: { contains: query.filter.search, mode: 'insensitive' } },
                  { name: { contains: query.filter.search, mode: 'insensitive' } },
                ]
              : undefined;
            break;
          case 'createdAt':
            // Handle date range filter as object with start/end Date properties
            if (query.filter.createdAt) {
              where.createdAt = {
                ...(query.filter.createdAt.start && { gte: query.filter.createdAt.start }),
                ...(query.filter.createdAt.end && { lte: query.filter.createdAt.end }),
              };
            }
            break;
        }
      }
    }

    const items = await client.user.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.UserFindManyArgs),
    });
    const totalItems = await client.user.count({ where });

    return {
      items: items.map((user) => UserPrismaRepository.toIUser(user)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async list(filter: IUserPaginationFilter, tx?: Prisma.TransactionClient): Promise<IUser[]> {
    const client = tx ?? this.prismaService.client;
    const where: Prisma.UserWhereInput = {};

    if (filter) {
      for (const key of Object.keys(filter)) {
        switch (key) {
          case 'ids':
            where.id = { in: filter.ids };
            break;
          case 'email':
            where.email = filter.email;
            break;
          case 'search':
            where.OR = filter.search
              ? [
                  { email: { contains: filter.search, mode: 'insensitive' } },
                  { name: { contains: filter.search, mode: 'insensitive' } },
                ]
              : undefined;
            break;
          case 'createdAt':
            // Handle date range filter as object with start/end Date properties
            if (filter.createdAt) {
              where.createdAt = {
                ...(filter.createdAt.start && { gte: filter.createdAt.start }),
                ...(filter.createdAt.end && { lte: filter.createdAt.end }),
              };
            }
            break;
        }
      }
    }

    return await client.user
      .findMany({
        where,
      })
      .then((users) => users.map((user) => UserPrismaRepository.toIUser(user)));
  }

  async find(where: { id: string }, tx?: Prisma.TransactionClient): Promise<IUser | null> {
    const client = tx ?? this.prismaService.client;

    if (!where.id) {
      throw new Error('Id is required');
    }

    const entity = await client.user.findUnique({
      where,
    });

    if (!entity) {
      return null;
    }

    return UserPrismaRepository.toIUser(entity);
  }

  async create(data: IUserCreate, tx?: Prisma.TransactionClient): Promise<IUser> {
    const client = tx ?? this.prismaService.client;
    const user = await client.user.create({
      data,
    });

    return UserPrismaRepository.toIUser(user);
  }

  async update(where: { id: string }, data: IUserUpdate, tx?: Prisma.TransactionClient): Promise<IUser> {
    const client = tx ?? this.prismaService.client;
    if (!where.id) {
      throw new Error('Id is required');
    }

    const user = await client.user.update({
      where,
      data: {
        email: data.email,
        name: data.name,
        roles: data.roles,
      },
    });

    return UserPrismaRepository.toIUser(user);
  }

  async delete(where: { id: string }, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.prismaService.client;
    if (!where.id) {
      throw new Error('Id is required');
    }

    await client.user.delete({
      where,
    });
  }

  async listLabels(query: IUserLabelsRequest, tx?: Prisma.TransactionClient): Promise<{ id: string; label: string }[]> {
    const client = tx ?? this.prismaService.client;
    const limit = query.limit ?? 20;

    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const items = await client.user.findMany({
      where,
      select: { id: true, email: true, name: true },
      take: limit,
    });

    return items.map((item) => {
      const id = query.field === UserLabelsField.EMAIL ? item.email || item.id : item.id;

      let label: string;
      switch (query.name) {
        case UserLabelsName.EMAIL:
          label = item.email || '';
          break;
        case UserLabelsName.NAME:
          label = item.name || '';
          break;
        case UserLabelsName.NAME_EMAIL:
        default: {
          label = `${item.name} (${item.email})`;
          break;
        }
      }

      return { id, label };
    });
  }

  private static toIUser(data: User): IUser {
    return {
      id: data.id,
      email: data.email || undefined,
      name: data.name || undefined,
      roles: (data.roles || []) as UserRole[],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } satisfies IUser;
  }
}

export const UserPrismaRepositoryPlugin: ModuleMetadata = {
  providers: [{ provide: UserRepository, useClass: UserPrismaRepository }],
  exports: [UserRepository],
};
