import { Injectable, ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma } from '~database/prisma/client';
import { Transaction } from '~database/types';

import { IRocketModelPaginationQuery } from '../../models/rocket-model.pagination.request';
import { IRocketModel, IRocketModelCreate, IRocketModelUpdate } from '../../models/rocket-model.types';
import { RocketModelRepository } from '../../rocket-model.repository';

@Injectable()
export class RocketModelPrismaRepository implements RocketModelRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async paginate(
    query: IRocketModelPaginationQuery,
    tx?: Prisma.TransactionClient,
  ): Promise<IPagination<IRocketModel>> {
    const client = tx || this.prismaService.client;
    const where: Prisma.RocketModelWhereInput = {};

    if (query.filter) {
      // Search takes precedence over exact name match
      if (query.filter.search) {
        where.name = { contains: query.filter.search, mode: 'insensitive' };
      } else if (query.filter.name) {
        where.name = query.filter.name;
      }
    }

    const orderBy = query.order?.map((order) => ({
      [order.property]: order.direction,
    }));

    const items = await client.rocketModel.findMany({
      where,
      orderBy,
      ...(paginationToPrismaQuery(query) as Prisma.RocketModelFindManyArgs),
    });

    const totalItems = await client.rocketModel.count({ where });

    return {
      items: items.map((x) => RocketModelPrismaRepository.toDomain(x)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async find(where: { id: string }, tx?: Prisma.TransactionClient): Promise<IRocketModel | null> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const client = tx || this.prismaService.client;
    const entity = await client.rocketModel.findUnique({
      where,
    });

    if (!entity) {
      return null;
    }

    return RocketModelPrismaRepository.toDomain(entity);
  }

  async findByName(name: string, tx?: Prisma.TransactionClient): Promise<IRocketModel | null> {
    const client = tx || this.prismaService.client;
    const entity = await client.rocketModel.findUnique({
      where: { name },
    });

    if (!entity) {
      return null;
    }

    return RocketModelPrismaRepository.toDomain(entity);
  }

  async create(data: IRocketModelCreate, tx?: Prisma.TransactionClient): Promise<IRocketModel> {
    const client = tx || this.prismaService.client;
    const entity = await client.rocketModel.create({
      data,
    });
    return RocketModelPrismaRepository.toDomain(entity);
  }

  async update(where: { id: string }, data: IRocketModelUpdate, tx?: Prisma.TransactionClient): Promise<IRocketModel> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const client = tx || this.prismaService.client;
    const entity = await client.rocketModel.update({
      where,
      data,
    });
    return RocketModelPrismaRepository.toDomain(entity);
  }

  async delete(where: { id: string }, tx?: Prisma.TransactionClient): Promise<void> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const client = tx || this.prismaService.client;
    await client.rocketModel.delete({ where });
  }

  withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.prismaService.client.$transaction((prisma) => {
      return fn(prisma);
    });
  }

  public static toDomain(data: Prisma.RocketModelGetPayload<{}>): IRocketModel {
    return {
      id: data.id,
      name: data.name,
      organization: data.organization ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}

export const RocketModelPrismaRepositoryPlugin: ModuleMetadata = {
  providers: [{ provide: RocketModelRepository, useClass: RocketModelPrismaRepository }],
  exports: [RocketModelRepository],
};
