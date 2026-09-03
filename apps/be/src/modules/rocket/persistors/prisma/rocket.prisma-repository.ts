import { Injectable, ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma } from '~database/prisma/client';
import { Transaction } from '~database/types';

import { ILabelResponse } from '~modules/admin/common/models';

import {
  IRocket,
  IRocketCreate,
  IRocketLabelsRequest,
  IRocketPaginationQuery,
  IRocketUpdate,
  RocketLabelsField,
  RocketLabelsName,
  RocketStatusType,
  RocketType,
} from '../../models';
import { RocketRepository } from '../../rocket.repository';

type RocketWithTimelapses = Prisma.RocketGetPayload<{
  include: {
    model: true;
    timelapses: {
      select: {
        pictureId: true;
      };
    };
  };
}>;

@Injectable()
export class RocketPrismaRepository implements RocketRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async paginate(query: IRocketPaginationQuery, tx?: Prisma.TransactionClient): Promise<IPagination<IRocket>> {
    const client = tx || this.prismaService.client;
    const where: Prisma.RocketWhereInput = {};

    for (const [key, value] of query.filter ? Object.entries(query.filter) : []) {
      if (!value) {
        continue;
      }
      switch (key) {
        case 'ids':
          where.id = { in: value };
          break;
        case 'name':
        case 'status':
        case 'ownerId':
          where[key] = value;
          break;
        case 'model':
          where.model = { name: value };
          break;
        case 'search':
          where.OR = [
            { name: { contains: value, mode: 'insensitive' } },
            { model: { name: { contains: value, mode: 'insensitive' } } },
          ];
          break;
      }
    }

    const items = (await client.rocket.findMany({
      where,
      include: {
        model: true,
        timelapses: {
          select: {
            pictureId: true,
          },
        },
      },
      ...(paginationToPrismaQuery(query) as Prisma.RocketFindManyArgs),
    })) as unknown as RocketWithTimelapses[];

    const totalItems = await client.rocket.count({ where });

    return {
      items: items.map((x) => RocketPrismaRepository.toDomain(x)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async find(where: { id: string; ownerId?: string }, tx?: Prisma.TransactionClient): Promise<IRocket | null> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const client = tx || this.prismaService.client;
    const entity = await client.rocket.findUnique({
      where,
      include: {
        model: true,
        timelapses: {
          select: {
            pictureId: true,
          },
        },
      },
    });

    if (!entity) {
      return null;
    }

    return RocketPrismaRepository.toDomain(entity);
  }

  async findNextLaunch(tx?: Prisma.TransactionClient): Promise<IRocket | null> {
    const client = tx || this.prismaService.client;
    const now = new Date();
    
    const entity = await client.rocket.findFirst({
      where: {
        launchDatetime: {
          gte: now,
        },
      },
      orderBy: {
        launchDatetime: 'asc',
      },
      include: {
        model: true,
        timelapses: {
          select: {
            pictureId: true,
          },
        },
      },
    });

    if (!entity) {
      return null;
    }

    return RocketPrismaRepository.toDomain(entity);
  }

  async create(data: IRocketCreate, tx?: Prisma.TransactionClient): Promise<IRocket> {
    const client = tx || this.prismaService.client;
    const entity = await client.rocket.create({
      data: {
        id: data.id,
        name: data.name,
        modelId: data.modelId,
        status: data.status,
        ownerId: data.ownerId,
        // Assignment fields
        height: data.height,
        weight: data.weight,
        launchDatetime: data.launchDatetime,
        rocketType: data.rocketType,
        passengers: data.passengers,
        crew: data.crew,
      },
      include: {
        model: true,
        timelapses: {
          select: {
            pictureId: true,
          },
        },
      },
    });
    return RocketPrismaRepository.toDomain(entity);
  }

  async update(
    where: { id: string; ownerId?: string },
    data: IRocketUpdate,
    tx?: Prisma.TransactionClient,
  ): Promise<IRocket> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const client = tx || this.prismaService.client;
    const entity = await client.rocket.update({
      where,
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.modelId !== undefined && { modelId: data.modelId }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.ownerId !== undefined && { ownerId: data.ownerId }),
        // Assignment fields
        ...(data.height !== undefined && { height: data.height }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.launchDatetime !== undefined && { launchDatetime: data.launchDatetime }),
        ...(data.rocketType !== undefined && { rocketType: data.rocketType }),
        ...(data.passengers !== undefined && { passengers: data.passengers }),
        ...(data.crew !== undefined && { crew: data.crew }),
        pictureId: data.picture === null ? null : data.picture?.id,
        timelapses: {
          // create associated timelapses
          connectOrCreate: data.timelapses?.map((x) => ({ where: { pictureId: x.id }, create: { pictureId: x.id } })),
          // delete timelapses not in the list
          deleteMany: {
            pictureId: {
              notIn: data.timelapses?.map((x) => x.id),
            },
          },
        },
      },
      include: {
        model: true,
        timelapses: true,
      },
    });
    return RocketPrismaRepository.toDomain(entity);
  }

  public async delete(where: { id: string; ownerId?: string }, tx?: Prisma.TransactionClient): Promise<void> {
    if (!where.id) {
      throw new Error('Id is required');
    }
    const client = tx || this.prismaService.client;
    await client.rocketTimelapse.deleteMany({ where: { rocketId: where.id } });
    await client.rocket.delete({ where });
  }

  async listLabels(query: IRocketLabelsRequest, tx?: Prisma.TransactionClient): Promise<ILabelResponse[]> {
    const client = tx || this.prismaService.client;
    const limit = query.limit ?? 20;

    if ([RocketLabelsField.MODEL_ID, RocketLabelsField.MODEL_NAME].includes(query.field)) {
      const where: Prisma.RocketModelWhereInput = {};

      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: 'insensitive' } },
          { organization: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      const items = await client.rocketModel.findMany({
        where,
        select: { id: true, name: true, organization: true },
        distinct: ['name'],
        take: limit,
      });

      return items.map((item) => ({
        id: query.field === RocketLabelsField.MODEL_ID ? item.id : item.name,
        label: query.name === RocketLabelsName.NAME ? item.name : `${item.name} (${item.organization})`,
      }));
    }

    const where: Prisma.RocketWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const items = await client.rocket.findMany({
      where,
      select: { name: true, model: { select: { name: true } }, id: true },
      distinct: ['name'],
      take: limit,
    });

    return items.map((item) => ({
      id: query.field === RocketLabelsField.NAME ? item.name : item.id,
      label: query.name === RocketLabelsName.NAME ? item.name : `${item.model?.name ?? ''} (${item.model?.name ?? ''})`,
    }));
  }

  public static toDomain(data: RocketWithTimelapses): IRocket {
    return {
      id: data.id,
      name: data.name,
      modelId: data.modelId ?? undefined,
      model: data.model
        ? {
            id: data.model.id,
            name: data.model.name,
            organization: data.model.organization ?? undefined,
          }
        : undefined,
      // Assignment fields
      height: data.height ? Number(data.height) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      launchDatetime: data.launchDatetime ?? undefined,
      rocketType: data.rocketType as RocketType | undefined,
      passengers: data.passengers as string[] | undefined,
      crew: data.crew as string[] | undefined,
      picture: data.pictureId ? { id: data.pictureId } : undefined,
      timelapses: data.timelapses ? data.timelapses.map((x) => ({ id: x.pictureId })) : [],
      status: data.status as RocketStatusType,
      ownerId: data.ownerId ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.prismaService.client.$transaction((prisma) => {
      return fn(prisma);
    });
  }
}

export const RocketPrismaRepositoryPlugin: ModuleMetadata = {
  providers: [{ provide: RocketRepository, useClass: RocketPrismaRepository }],
  exports: [RocketRepository],
};
