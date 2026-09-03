import { Injectable, type ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { JsonObject } from '~common/types';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma } from '~database/prisma/client';

import { ActivityRepository } from '../../activity.repository';
import { IActivity, IActivityCreate } from '../../models/activity.types';
import { IActivityAggregation, IActivityAggregationQuery } from '../../models/activity-aggregation.request';
import { ActivityPaginationOrderField, IActivityPaginationQuery } from '../../models/activity-pagination.request';

@Injectable()
export class PrismaActivityRepository implements ActivityRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: IActivityCreate, tx?: Prisma.TransactionClient): Promise<IActivity> {
    const client = tx ?? this.prismaService.client;
    const activity = await client.activity.create({
      data: {
        id: data.id,

        timestamp: data.timestamp ?? new Date(),
        payload: data.payload as Prisma.InputJsonValue,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,

        module: data.module,
        type: data.type,

        userId: data.userId,
        resourceId: data.resourceId,
      },
    });

    return PrismaActivityRepository.toDomain(activity);
  }

  async paginate(query: IActivityPaginationQuery, tx?: Prisma.TransactionClient): Promise<IPagination<IActivity>> {
    const client = tx ?? this.prismaService.client;
    const where: Prisma.ActivityWhereInput = {};

    if (query.filter) {
      for (const [key, value] of Object.entries(query.filter).filter(([, value]) => !!value)) {
        switch (key) {
          case 'ids':
            where.id = { in: value };
            break;
          case 'timestamp':
            if (query.filter.timestamp) {
              where.timestamp = {
                ...(query.filter.timestamp.start && { gte: query.filter.timestamp.start }),
                ...(query.filter.timestamp.end && { lte: query.filter.timestamp.end }),
              };
            }
            break;
          case 'module':
          case 'type':
          case 'userId':
          case 'resourceId':
            where[key] = value;
            break;
          case 'search':
            where.OR = [
              { module: { contains: value, mode: 'insensitive' } },
              { type: { contains: value, mode: 'insensitive' } },
              { payload: { string_contains: value, mode: 'insensitive' } },
            ];
            break;
          case 'payload':
            where.AND = Object.entries(value).map(([key, value]) => ({
              payload: { string_contains: value as string, path: [key] },
            }));
            break;
          default:
            throw new Error(`Invalid filter key: ${key}`);
        }
      }
    }

    if (!query.order) {
      query.order = [{ property: ActivityPaginationOrderField.timestamp, direction: 'desc' }];
    }

    const items = await client.activity.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.ActivityFindManyArgs),
    });
    const totalItems = await client.activity.count({ where });

    return {
      items: items.map((activity) => PrismaActivityRepository.toDomain(activity)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async aggregate(query: IActivityAggregationQuery, tx?: Prisma.TransactionClient): Promise<IActivityAggregation[]> {
    const client = tx ?? this.prismaService.client;

    const whereConditions: Prisma.Sql[] = [];

    if (query.module) {
      whereConditions.push(Prisma.sql`module = ${query.module}`);
    }
    if (query.type) {
      whereConditions.push(Prisma.sql`type = ${query.type}`);
    }
    if (query.timestamp?.start) {
      whereConditions.push(Prisma.sql`timestamp >= ${query.timestamp.start}`);
    }
    if (query.timestamp?.end) {
      whereConditions.push(Prisma.sql`timestamp <= ${query.timestamp.end}`);
    }
    if (query.userId) {
      whereConditions.push(Prisma.sql`"user_id" = ${query.userId}`);
    }
    if (query.resourceId) {
      whereConditions.push(Prisma.sql`"resource_id" = ${query.resourceId}`);
    }

    const whereClause =
      whereConditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(whereConditions, ' AND ')}` : Prisma.empty;

    const sql = Prisma.sql`
      SELECT
        DATE_TRUNC(${query.timeBucket}, timestamp) as bucket,
        COUNT(*)::int as count
      FROM "Activity"
      ${whereClause}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    const result = await client.$queryRaw<Array<{ bucket: Date; count: bigint }>>(sql);

    return result.map((row) => ({
      bucket: row.bucket,
      count: Number(row.count),
    }));
  }

  async find(where: { id: string }, tx?: Prisma.TransactionClient): Promise<IActivity | null> {
    const client = tx ?? this.prismaService.client;

    if (!where.id) {
      throw new Error('Id is required');
    }

    const entity = await client.activity.findUnique({
      where,
    });

    if (!entity) {
      return null;
    }

    return PrismaActivityRepository.toDomain(entity);
  }

  static toDomain(data: {
    id: string;
    timestamp: Date;
    payload: unknown;
    metadata: unknown;

    module: string;
    type: string;

    userId: string | null;
    resourceId: string | null;
  }): IActivity {
    return {
      id: data.id,

      timestamp: data.timestamp,
      payload: data.payload as JsonObject,
      metadata: data.metadata ? (data.metadata as JsonObject) : undefined,

      module: data.module,
      type: data.type,

      userId: data.userId ?? undefined,
      resourceId: data.resourceId ?? undefined,
    } satisfies IActivity;
  }
}

export const PrismaActivityPersistorPlugin: ModuleMetadata = {
  providers: [{ provide: ActivityRepository, useClass: PrismaActivityRepository }],
  exports: [ActivityRepository],
};
