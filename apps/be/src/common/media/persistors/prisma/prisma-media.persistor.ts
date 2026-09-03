import { Injectable } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { MediaError } from '~common/media/media.exceptions';
import { JsonObject } from '~common/types';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { type Media, Prisma } from '~database/prisma/client';
import { Transaction } from '~database/types';

import { MediaPersistor } from '../../media-persistor.abstract';
import { IMedia, IMediaCreate, IMediaId, IMediaPaginationQuery, IMediaResourceName } from '../../models';
import { MediaLabelsRequest } from '../../models/media-labels.request';

@Injectable()
export class PrismaMediaPersistor implements MediaPersistor {
  constructor(private readonly prismaService: PrismaService) {}

  private toIMedia(media: Omit<Media, 'blob'>): IMedia {
    return {
      id: media.id,
      key: media.key,
      resourceName: media.resourceName,

      fileName: media.fileName,
      fileSize: media.fileSize,
      mimeType: media.mimeType,

      module: media.module || undefined,
      type: media.type || undefined,
      resourceId: media.resourceId || undefined,
      userId: media.userId || undefined,

      uploaded: media.uploaded ?? undefined,
      validated: media.validated ?? undefined,
      deleted: media.deleted ?? undefined,
      provider: media.provider,

      meta: (media.meta ?? {}) as Record<string, JsonObject>,
      createdAt: media.createdAt,
    };
  }

  async find(where: { id: IMediaId } | { key: string }, tx?: Prisma.TransactionClient): Promise<IMedia | null> {
    const client = tx || this.prismaService.client;
    const result = await client.media.findUnique({
      where: 'id' in where ? { id: where.id } : { key: where.key },
    });
    return result ? this.toIMedia(result) : null;
  }

  async list(
    options: {
      where: {
        id?: IMediaId | IMediaId[];
        key?: string | string[];
        resourceName?: IMediaResourceName;
        module?: string;
        type?: string;
        resourceId?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        uploaded?: boolean;
        validated?: boolean;
        userId?: string;
      };
      skip?: number;
      take?: number;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<IMedia[]> {
    const client = tx || this.prismaService.client;
    const where: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(options.where).filter(([, v]) => v !== undefined)) {
      switch (key) {
        case 'id':
        case 'key':
          where[key] = Array.isArray(value) ? { in: value } : value;
          break;
        case 'resourceName':
        case 'module':
        case 'type':
        case 'resourceId':
        case 'fileName':
        case 'fileSize':
        case 'mimeType':

        case 'provider':
        case 'userId':
          where[key] = value;
          break;
        case 'deleted':
        case 'uploaded':
        case 'validated':
          where[key] = value ? { not: null } : null;
          break;
        default:
          throw new Error('Invalid where parameter');
      }
    }
    return client.media
      .findMany({
        where,
        skip: options.skip ?? 0,
        take: options.take ?? 10,
      })
      .then((media) => media.map(this.toIMedia));
  }

  public async count(
    where?: {
      type?: string | string[];
      module?: string | string[];
      mimeType?: string | string[];
      userId?: string | string[];
      provider?: string | string[];
      resourceName?: string | string[];
    },
    options?: { groupBy?: 'type' | 'module' | 'provider' | 'userId' | 'mimeType' | 'resourceName' },
    tx?: Prisma.TransactionClient,
  ): Promise<Record<string, number> & { total?: number }> {
    const client = tx || this.prismaService.client;
    const whereClause: Prisma.MediaWhereInput = {};

    if (where) {
      for (const [key, value] of Object.entries(where)) {
        if (value !== undefined) {
          whereClause[key as keyof typeof where] = Array.isArray(value) ? { in: value } : value;
        }
      }
    }
    if (options?.groupBy) {
      const groupByField = options.groupBy;

      const groupedResults = await client.media.groupBy({
        by: [groupByField],
        where: whereClause,
        _count: {
          _all: true,
        },
      });

      const result: Record<string, number> = {};
      for (const group of groupedResults) {
        const value = group[groupByField];
        if (value !== null && value !== undefined) {
          result[value] = group._count._all;
        }
      }

      return result;
    }

    const count = await client.media.count({
      where: whereClause,
    });

    return { total: count };
  }

  async create(data: IMediaCreate, tx?: Prisma.TransactionClient): Promise<IMedia> {
    const client = tx || this.prismaService.client;
    return client.media.create({ data }).then(this.toIMedia);
  }

  async update(
    where: ({ id: IMediaId } | { key: string }) & { resourceName?: string },
    data: Partial<IMedia>,
    tx?: Prisma.TransactionClient,
  ): Promise<IMedia> {
    if (!('id' in where) && !('key' in where)) {
      throw new Error('Either id or key must be provided');
    }

    const client = tx || this.prismaService.client;

    const updateData: Partial<IMedia> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        switch (key) {
          case 'deleted':
            updateData.deleted = value ? new Date() : undefined;
            break;
          case 'uploaded':
            updateData.uploaded = value ? new Date() : undefined;
            break;
          case 'validated':
            updateData.validated = value ? new Date() : undefined;
            break;
          default:
            updateData[key as keyof IMedia] = value as never;
            break;
        }
      }
    }

    return client.media
      .update({
        where,
        data: {
          ...data,
        },
      })
      .then(this.toIMedia);
  }

  async paginate(query: IMediaPaginationQuery, tx?: Prisma.TransactionClient): Promise<IPagination<IMedia>> {
    const client = tx || this.prismaService.client;
    const where: Prisma.MediaWhereInput = {};

    if (query.filter) {
      const andConditions: Prisma.MediaWhereInput[] = [];

      for (const [key, value] of Object.entries(query.filter).filter(([, v]) => v !== undefined)) {
        switch (key) {
          case 'ids':
            where.id = { in: query.filter.ids };
            break;

          case 'search':
            if (query.filter.search) {
              andConditions.push({
                OR: [
                  {
                    fileName: { contains: query.filter.search, mode: 'insensitive' },
                    resourceName: { contains: query.filter.search, mode: 'insensitive' },
                    module: { contains: query.filter.search, mode: 'insensitive' },
                    type: { contains: query.filter.search, mode: 'insensitive' },
                  },
                ],
              });
            }
            break;
          case 'fileSizeRanges':
            if (query.filter.fileSizeRanges && query.filter.fileSizeRanges.length > 0) {
              const rangeConditions = query.filter.fileSizeRanges.map((range) => ({
                fileSize: {
                  gte: range.minSize,
                  lte: range.maxSize,
                },
              }));
              andConditions.push({
                OR: rangeConditions,
              });
            }
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
          case 'mimeTypes':
            where.mimeType = { in: query.filter.mimeTypes };
            break;
          case 'module':
          case 'type':
          case 'userId':
            where[key] = value;
            break;
          case 'uploaded':
          case 'validated':
            where[key] = value ? { not: null } : null;
            break;
          case 'deleted':
            where.deleted = value ? { not: null } : null;
            break;
          default:
            throw new Error(`Invalid filter parameter: ${key}`);
        }
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }
    }

    const items = await client.media.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.MediaFindManyArgs),
    });
    const totalItems = await client.media.count({ where });

    return {
      items: items.map((media) => this.toIMedia(media)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async markForDeletion(where: { id: IMediaId }, tx?: Prisma.TransactionClient): Promise<IMedia | null> {
    const client = tx || this.prismaService.client;
    try {
      return await client.media
        .update({
          where,
          data: { deleted: new Date() },
        })
        .then(this.toIMedia);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw new MediaError('Failed to mark media for deletion', {
        code: 'media-mark-for-deletion-failed',
        cause: error,
      });
    }
  }

  async delete(where: { id: IMediaId }, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || this.prismaService.client;
    await client.media.delete({ where });
  }

  async listLabels(
    query: MediaLabelsRequest,
    tx?: Prisma.TransactionClient,
  ): Promise<Array<{ id: string; label: string }>> {
    const client = tx || this.prismaService.client;
    const { field, search, limit = 20 } = query;

    const where: Prisma.MediaWhereInput = {};

    if (search) {
      where[field] = { contains: search, mode: 'insensitive' };
    }

    const result = await client.media.findMany({
      select: { [field]: true } as Prisma.MediaSelect,
      distinct: [field],
      where,
      take: limit,
    });

    return result
      .map((item) => {
        const value = (item as unknown as Record<string, string | null>)[field];
        return value ? { id: value, label: value } : null;
      })
      .filter((item): item is { id: string; label: string } => item !== null);
  }

  withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.prismaService.client.$transaction((prisma) => {
      return fn(prisma);
    });
  }
}
