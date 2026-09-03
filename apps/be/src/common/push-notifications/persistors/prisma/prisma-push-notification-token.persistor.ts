import { BadRequestException, Injectable, ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { makeUUID } from '~common/utils/short-uuid';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma, PushNotificationToken } from '~database/prisma/client';

import {
  IPushNotificationToken,
  IPushNotificationTokenCreate,
  IPushNotificationTokenPaginationQuery,
} from '../../models';
import {
  IPushNotificationLabelsRequest,
  PushNotificationLabelsField,
  PushNotificationLabelsName,
} from '../../models/push-notification-labels.request';
import { PushNotificationTokenPersistor } from '../../push-notification-token-persistor.abstract';

@Injectable()
export class PrismaPushNotificationTokenPersistor implements PushNotificationTokenPersistor {
  constructor(private readonly prismaService: PrismaService) {}

  private toIPushNotificationToken(token: PushNotificationToken): IPushNotificationToken {
    return {
      id: token.id,
      token: token.token,
      resourceName: token.resourceName,
      resourceLabel: token.resourceLabel ?? undefined,
      module: token.module ?? undefined,
      resourceId: token.resourceId ?? undefined,
      title: token.title || undefined,
      provider: token.provider,
      expiresAt: token.expiresAt || undefined,
      createdAt: token.createdAt,
    };
  }

  public async find(where: { id: string }): Promise<IPushNotificationToken | null> {
    const item = await this.prismaService.client.pushNotificationToken.findUnique({
      where: { id: where.id },
    });
    return item ? this.toIPushNotificationToken(item) : null;
  }

  public async list(options: {
    where: {
      id?: string | string[];
      resourceName?: string | string[];
      token?: string | string[];
      provider?: string | string[];
      expiresAt__gt?: Date;
    };
    skip?: number;
    take?: number;
  }): Promise<IPushNotificationToken[]> {
    const where: Prisma.PushNotificationTokenWhereInput = {};
    for (const [key, value] of Object.entries(options.where)) {
      switch (key) {
        case 'id':
        case 'resourceName':
        case 'token':
        case 'provider':
          where[key] = Array.isArray(value) ? { in: value } : (value as string);
          break;
        case 'expiresAt__gt':
          where.expiresAt = { gt: value as Date };
          break;
        default:
          throw new Error('Invalid where parameter');
      }
    }
    return this.prismaService.client.pushNotificationToken
      .findMany({
        where,
        skip: options.skip ?? 0,
        take: options.take ?? 10,
      })
      .then((items) => items.map(this.toIPushNotificationToken));
  }

  public async paginate(
    query: IPushNotificationTokenPaginationQuery,
    options?: { resourceName?: string },
  ): Promise<IPagination<IPushNotificationToken>> {
    const where: Prisma.PushNotificationTokenWhereInput = {};

    if (query.filter) {
      for (const key of Object.keys(query.filter)) {
        switch (key) {
          case 'provider':
            where.provider = query.filter.provider;
            break;
          case 'search':
            where.resourceName = { contains: query.filter.search, mode: 'insensitive' };
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
          default:
            throw new BadRequestException(`Invalid filter key: ${key}`);
        }
      }
    }

    if (options?.resourceName) {
      where.resourceName = options.resourceName;
    }

    const items = await this.prismaService.client.pushNotificationToken.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.PushNotificationTokenFindManyArgs),
    });
    const totalItems = await this.prismaService.client.pushNotificationToken.count({ where });

    return {
      items: items.map(this.toIPushNotificationToken),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  public async create(data: IPushNotificationTokenCreate): Promise<IPushNotificationToken> {
    return this.toIPushNotificationToken(
      await this.prismaService.client.pushNotificationToken.create({ data: { ...data, id: data.id ?? makeUUID() } }),
    );
  }

  public async update(where: { id: string }, data: Partial<IPushNotificationToken>): Promise<IPushNotificationToken> {
    if (!('id' in where) || !where.id) {
      throw new Error('Either id or key must be provided');
    }
    return this.toIPushNotificationToken(
      await this.prismaService.client.pushNotificationToken.update({
        where: { id: where.id },
        data,
      }),
    );
  }

  public async delete(where: {
    id?: string | string[];
    token?: string | string[];
    resourceName?: string | string[];
    expiresAt__lt?: Date;
  }): Promise<number> {
    const deleteWhere: Prisma.PushNotificationTokenWhereInput = {};
    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case 'id':
        case 'token':
        case 'resourceName':
          deleteWhere[key] = Array.isArray(value) ? { in: value } : (value as string);
          break;
        case 'expiresAt__lt':
          deleteWhere.expiresAt = { lt: value as Date };
          break;
        default:
          throw new Error('Invalid where parameter');
      }
    }
    const deleted = await this.prismaService.client.pushNotificationToken.deleteMany({ where: deleteWhere });

    // all good
    return deleted.count;
  }

  public async listLabels(query: IPushNotificationLabelsRequest): Promise<{ id: string; label: string }[]> {
    const limit = query.limit ?? 20;
    const where: Prisma.PushNotificationTokenWhereInput = {};

    if (query.search) {
      where.OR = [
        { resourceName: { contains: query.search, mode: 'insensitive' } },
        { resourceLabel: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const selectFields: Prisma.PushNotificationTokenSelect = {
      token: true,
      resourceName: true,
      resourceLabel: true,
      title: true,
    };

    const findManyArgs: Prisma.PushNotificationTokenFindManyArgs = {
      where,
      select: selectFields,
      take: limit,
    };

    if (query.field === PushNotificationLabelsField.RESOURCENAME) {
      findManyArgs.distinct = ['resourceName'];
    }

    const items = await this.prismaService.client.pushNotificationToken.findMany(findManyArgs);

    return items.map((item) => {
      let id: string;
      switch (query.field) {
        case PushNotificationLabelsField.ID:
          id = item.id;
          break;
        case PushNotificationLabelsField.TOKEN:
          id = item.token || '';
          break;
        case PushNotificationLabelsField.RESOURCENAME:
          id = item.resourceName || '';
          break;
        default:
          throw new Error('Invalid field');
      }

      let label: string;
      switch (query.name) {
        case PushNotificationLabelsName.TITLE:
          label = item.title || '';
          break;
        case PushNotificationLabelsName.RESOURCELABEL:
          label = item.resourceLabel || item.resourceName || '';
          break;
        case PushNotificationLabelsName.RESOURCENAME:
          label = item.resourceName || '';
          break;
        case PushNotificationLabelsName.RESOURCELABEL_TITLE:
        default: {
          const resourceLabel = item.resourceLabel || item.resourceName || '';
          const title = item.title || '';
          label = resourceLabel && title ? `${resourceLabel} - ${title}` : resourceLabel || title;
          break;
        }
      }

      return { id, label };
    });
  }
}

/**
 * Store push notification tokens using Prisma
 */
export const PrismaPushNotificationTokenPersistorPlugin: ModuleMetadata = {
  providers: [{ provide: PushNotificationTokenPersistor, useClass: PrismaPushNotificationTokenPersistor }],
  exports: [PushNotificationTokenPersistor],
};
