import { Injectable, ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { AdminUser, Prisma } from '~database/prisma/client';

import { AdminUserRepository } from '../../admin-user.repository';
import type {
  IAdminUser,
  IAdminUserCreate,
  IAdminUserPaginationQuery,
  IAdminUserUpdate,
} from '../../models/admin-user.types';

@Injectable()
export class AdminUserPrismaRepository implements AdminUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async paginate(query: IAdminUserPaginationQuery, tx?: Prisma.TransactionClient): Promise<IPagination<IAdminUser>> {
    const client = tx ?? this.prismaService.client;
    const where: Prisma.AdminUserWhereInput = {};

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

    const items = await client.adminUser.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.AdminUserFindManyArgs),
    });
    const totalItems = await client.adminUser.count({ where });

    return {
      items: items.map((user) => AdminUserPrismaRepository.toIAdminUser(user)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async find(where: { id: string }, tx?: Prisma.TransactionClient): Promise<IAdminUser | null> {
    const client = tx ?? this.prismaService.client;
    if (!where.id) {
      throw new Error('Id is required');
    }

    const entity = await client.adminUser.findUnique({
      where,
    });

    if (!entity) {
      return null;
    }

    return AdminUserPrismaRepository.toIAdminUser(entity);
  }

  async create(data: IAdminUserCreate, tx?: Prisma.TransactionClient): Promise<IAdminUser> {
    const client = tx ?? this.prismaService.client;
    const user = await client.adminUser.create({
      data,
    });

    return AdminUserPrismaRepository.toIAdminUser(user);
  }

  async update(where: { id: string }, data: IAdminUserUpdate, tx?: Prisma.TransactionClient): Promise<IAdminUser> {
    const client = tx ?? this.prismaService.client;
    if (!where.id) {
      throw new Error('Id is required');
    }

    const user = await client.adminUser.update({
      where,
      data: {
        email: data.email,
        name: data.name,
        roles: data.roles,
      },
    });

    return AdminUserPrismaRepository.toIAdminUser(user);
  }

  async delete(where: { id: string }, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx ?? this.prismaService.client;
    if (!where.id) {
      throw new Error('Id is required');
    }

    await client.adminUser.delete({
      where,
    });
  }

  private static toIAdminUser(data: AdminUser): IAdminUser {
    return {
      id: data.id,
      email: data.email || undefined,
      name: data.name || undefined,
      roles: data.roles || [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } satisfies IAdminUser;
  }
}

export const AdminUserPrismaRepositoryPlugin: ModuleMetadata = {
  providers: [{ provide: AdminUserRepository, useClass: AdminUserPrismaRepository }],
  exports: [AdminUserRepository],
};
