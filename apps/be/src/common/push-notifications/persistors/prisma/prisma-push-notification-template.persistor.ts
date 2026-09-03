import { Injectable, ModuleMetadata } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import {
  IPushNotificationTemplateFilter,
  IPushNotificationTemplatePaginationQuery,
} from '~common/push-notifications/models/push-notification-template.pagination.request';
import { PushNotificationTemplateProvider } from '~common/push-notifications/push-notification-template-provider.abstract';
import { JsonObject } from '~common/types';
import { makeUUID } from '~common/utils/short-uuid';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma, PushNotificationTemplate } from '~database/prisma/client';

import { ILabelResponse } from '~modules/admin/common/models';

import {
  IPushNotificationTemplate,
  IPushNotificationTemplateCreate,
  IPushNotificationTemplateUpdate,
  PushNotificationTemplateType,
} from '../../models';

@Injectable()
export class PrismaPushNotificationTemplatePersistor implements PushNotificationTemplateProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async find(where: {
    name: string;
    type?: PushNotificationTemplateType;
  }): Promise<IPushNotificationTemplate | null> {
    if (!('name' in where)) {
      throw new BadRequestException('Invalid where clause');
    }

    const template = await this.prismaService.client.pushNotificationTemplate.findUnique({
      where: { name: where.name },
    });

    return template ? PrismaPushNotificationTemplatePersistor.toIPushNotificationTemplate(template) : null;
  }

  async paginate(query: IPushNotificationTemplatePaginationQuery): Promise<IPagination<IPushNotificationTemplate>> {
    const where: Prisma.PushNotificationTemplateWhereInput = {};

    if (query.filter) {
      for (const [k, v] of Object.entries(query.filter)) {
        if (v) {
          switch (k) {
            case 'names':
              where.name = { in: v };
              break;
            case 'search':
              where.OR = [
                { name: { contains: v, mode: 'insensitive' } },
                { title: { contains: v, mode: 'insensitive' } },
                { body: { contains: v, mode: 'insensitive' } },
              ];
              break;
            case 'module':
              where.module = v;
              break;
            case 'title':
              where.title = { contains: v, mode: 'insensitive' };
              break;
            case 'type':
              where.type = v;
              break;
            default:
              throw new BadRequestException(`Invalid filter key: ${k}`);
          }
        }
      }
    }

    const items = await this.prismaService.client.pushNotificationTemplate.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.PushNotificationTemplateFindManyArgs),
    });
    const totalItems = await this.prismaService.client.pushNotificationTemplate.count({ where });

    return {
      items: items.map((entity) => PrismaPushNotificationTemplatePersistor.toIPushNotificationTemplate(entity)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async create(data: IPushNotificationTemplateCreate): Promise<IPushNotificationTemplate> {
    if (!data.title) {
      throw new BadRequestException('Title is required for push notification template');
    }

    const template = await this.prismaService.client.pushNotificationTemplate.create({
      data: {
        id: makeUUID(),
        name: data.name,
        title: data.title,
        body: data.body ?? undefined,
        imageUrl: data.imageUrl ?? undefined,
        data: data.data,
        type: data.type,
        module: data.module ?? '',
        description: data.description ?? '',
      },
    });

    return PrismaPushNotificationTemplatePersistor.toIPushNotificationTemplate(template);
  }

  async update(
    where: { name: string; type?: PushNotificationTemplateType },
    data: IPushNotificationTemplateUpdate,
  ): Promise<IPushNotificationTemplate> {
    if (!('name' in where)) {
      throw new BadRequestException('Invalid where clause');
    }

    const updates: Prisma.PushNotificationTemplateUpdateInput = {};
    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      switch (key) {
        case 'name':
        case 'module':
        case 'description':
        case 'data':
        case 'title':
        case 'body':
        case 'type':
        case 'imageUrl':
          updates[key] = data[key] as never;
          break;
        default:
          key satisfies never;
      }
    }

    try {
      const template = await this.prismaService.client.pushNotificationTemplate.update({
        where: { name: where.name },
        data: updates,
      });
      return PrismaPushNotificationTemplatePersistor.toIPushNotificationTemplate(template);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Template name must be unique');
      }
      throw error;
    }
  }

  async delete(where: { name: string; type?: PushNotificationTemplateType }): Promise<void> {
    if (!('name' in where)) {
      throw new BadRequestException('Invalid where clause');
    }

    await this.prismaService.client.pushNotificationTemplate.delete({
      where: { name: where.name },
    });
  }

  async list(filter: IPushNotificationTemplateFilter): Promise<IPushNotificationTemplate[]> {
    const where: Prisma.PushNotificationTemplateWhereInput = {};

    if (filter) {
      for (const [k, v] of Object.entries(filter)) {
        if (v) {
          switch (k) {
            case 'names':
              where.name = { in: v };
              break;
            case 'search':
              where.OR = [
                { name: { contains: v, mode: 'insensitive' } },
                { title: { contains: v, mode: 'insensitive' } },
                { body: { contains: v, mode: 'insensitive' } },
              ];
              break;
            case 'module':
              where.module = v;
              break;
            case 'title':
              where.title = { contains: v, mode: 'insensitive' };
              break;
            case 'type':
              where.type = v;
              break;
            default:
              throw new BadRequestException(`Invalid filter key: ${k}`);
          }
        }
      }
    }
    const templates = await this.prismaService.client.pushNotificationTemplate.findMany({
      where,
    });

    return templates.map(PrismaPushNotificationTemplatePersistor.toIPushNotificationTemplate);
  }

  async listLabels(query: {
    filter: { search?: string; type?: PushNotificationTemplateType; omit?: string[] };
    limit?: number;
  }): Promise<ILabelResponse[]> {
    const where: Prisma.PushNotificationTemplateWhereInput = {};

    if (query.filter) {
      const nameFilter: Prisma.StringFilter = {};

      if (query.filter.search) {
        nameFilter.contains = query.filter.search;
        nameFilter.mode = 'insensitive';
      }

      if (query.filter.omit && Array.isArray(query.filter.omit) && query.filter.omit.length > 0) {
        nameFilter.notIn = query.filter.omit;
      }

      if (Object.keys(nameFilter).length > 0) {
        where.name = nameFilter;
      }

      if (query.filter.type) {
        where.type = query.filter.type;
      }
    }

    return this.prismaService.client.pushNotificationTemplate
      .findMany({
        where,
        select: {
          name: true,
        },
        take: query.limit ?? 20,
      })
      .then((items) => items.map((item) => ({ id: item.name, label: item.name })));
  }

  public static toIPushNotificationTemplate(entity: PushNotificationTemplate): IPushNotificationTemplate {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type as PushNotificationTemplateType,
      module: entity.module ?? undefined,
      description: entity.description ?? undefined,
      title: entity.title ?? undefined,
      body: entity.body ?? undefined,
      imageUrl: entity.imageUrl ?? undefined,
      data: entity.data ? (entity.data as JsonObject) : undefined,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}

/**
 * Store push notification templates using Prisma
 */
export const PrismaPushNotificationTemplatePersistorPlugin: ModuleMetadata = {
  providers: [{ provide: PushNotificationTemplateProvider, useClass: PrismaPushNotificationTemplatePersistor }],
  exports: [PushNotificationTemplateProvider],
};
