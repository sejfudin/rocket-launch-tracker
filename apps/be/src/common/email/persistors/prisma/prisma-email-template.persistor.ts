import { Injectable, ModuleMetadata } from '@nestjs/common';

import {
  IEmailTemplateFilter,
  IEmailTemplatePaginationQuery,
} from '~common/email/models/email-template.pagination.request';
import { IEmailTemplateLabelsRequest } from '~common/email/models/email-template-labels.request';
import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import type { JsonObject } from '~common/types';
import { makeUUID } from '~common/utils/short-uuid';

import { PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { EmailTemplate, Prisma } from '~database/prisma/client';

import { ILabelResponse } from '~modules/admin/common/models';

import { EmailTemplateProvider } from '../../email-template-provider.abstract';
import {
  EmailCompilerType,
  EmailTemplateType,
  IEmailTemplate,
  IEmailTemplateCreate,
  IEmailTemplateUpdate,
} from '../../models';

@Injectable()
export class PrismaEmailTemplatePersistor implements EmailTemplateProvider {
  constructor(private readonly prismaService: PrismaService) {}

  public async find(where: { name: string; type?: EmailTemplateType }): Promise<IEmailTemplate | null> {
    if (!('name' in where)) {
      throw new BadRequestException('Invalid where clause');
    }

    const emailTemplate = await this.prismaService.client.emailTemplate.findUnique({
      where,
    });

    return emailTemplate ? PrismaEmailTemplatePersistor.toIEmailTemplate(emailTemplate) : null;
  }

  async paginate(query: IEmailTemplatePaginationQuery): Promise<IPagination<IEmailTemplate>> {
    const where: Prisma.EmailTemplateWhereInput = {};

    if (query.filter) {
      for (const [k, v] of Object.entries(query.filter)) {
        if (v) {
          switch (k) {
            case 'names':
              where.name = { in: v };
              break;
            case 'search':
              where.OR = [{ name: { contains: v, mode: 'insensitive' } }];
              break;
            case 'engine':
              where.engine = v;
              break;
            case 'module':
              where.module = v;
              break;
            case 'type':
              where.type = v;
              break;
            case 'updatedAt':
              where.updatedAt = {
                ...(v?.start && { gte: v.start }),
                ...(v?.end && { lte: v.end }),
              };
              break;
            default:
              throw new BadRequestException(`Invalid filter key: ${k}`);
          }
        }
      }
    }

    const items = await this.prismaService.client.emailTemplate.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.EmailTemplateFindManyArgs),
    });
    const totalItems = await this.prismaService.client.emailTemplate.count({ where });

    return {
      items: items.map((entity) => PrismaEmailTemplatePersistor.toIEmailTemplate(entity)),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async list(filter: IEmailTemplateFilter): Promise<IEmailTemplate[]> {
    const where: Prisma.EmailTemplateWhereInput = {};

    if (filter) {
      for (const [k, v] of Object.entries(filter)) {
        if (v) {
          switch (k) {
            case 'names':
              where.name = { in: v };
              break;
            case 'search':
              where.OR = [{ name: { contains: v, mode: 'insensitive' } }];
              break;
            case 'engine':
              where.engine = v;
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
    const templates = await this.prismaService.client.emailTemplate.findMany({
      where,
    });

    return templates.map(PrismaEmailTemplatePersistor.toIEmailTemplate);
  }

  async create(data: IEmailTemplateCreate): Promise<IEmailTemplate> {
    const template = await this.prismaService.client.emailTemplate.create({
      data: {
        id: makeUUID(),
        name: data.name,
        subject: data.subject,
        html: data.html,
        text: data.text,
        engine: data.engine,
        engineOptions: data.engineOptions,
        description: data.description,
        module: data.module,
        from: data.from,
        cc: JSON.stringify(data.cc || []),
        bcc: JSON.stringify(data.bcc || []),
        type: data.type,
      },
    });

    return PrismaEmailTemplatePersistor.toIEmailTemplate(template);
  }

  async update(where: { name: string; type?: EmailTemplateType }, data: IEmailTemplateUpdate): Promise<IEmailTemplate> {
    if (!('name' in where)) {
      throw new BadRequestException('Invalid where clause');
    }

    const updates: Prisma.EmailTemplateUpdateInput = {};
    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      switch (key) {
        case 'name':
        case 'subject':
        case 'html':
        case 'text':
        case 'engine':
        case 'engineOptions':
        case 'from':
        case 'type':
        case 'module':
        case 'description':
        case 'createdAt':
        case 'updatedAt':
          updates[key] = data[key];
          break;
        case 'cc':
        case 'bcc':
          updates[key] = data[key] ? data[key].join(',') : undefined;
          break;
        default:
          throw new BadRequestException(`Invalid update field: ${key}`);
      }
    }

    const template = await this.prismaService.client.emailTemplate.update({
      where,
      data: updates,
    });

    return PrismaEmailTemplatePersistor.toIEmailTemplate(template);
  }

  async delete(where: { name: string; type?: EmailTemplateType }): Promise<void> {
    if (!('name' in where)) {
      throw new BadRequestException('Invalid where clause');
    }

    await this.prismaService.client.emailTemplate.delete({
      where,
    });
  }

  async listLabels(query: IEmailTemplateLabelsRequest): Promise<ILabelResponse[]> {
    const where: Prisma.EmailTemplateWhereInput = {};

    if (query.search || query.omit || query.type) {
      const nameFilter: Prisma.StringFilter = {};

      if (query.search) {
        nameFilter.contains = query.search;
        nameFilter.mode = 'insensitive';
      }

      if (query.omit && Array.isArray(query.omit) && query.omit.length > 0) {
        nameFilter.notIn = query.omit;
      }

      if (Object.keys(nameFilter).length > 0) {
        where.name = nameFilter;
      }

      if (query.type) {
        where.type = query.type;
      }
    }

    return this.prismaService.client.emailTemplate
      .findMany({
        where,
        select: {
          name: true,
        },
        take: query.limit ?? 20,
      })
      .then((items) => items.map((item) => ({ id: item.name, label: item.name })));
  }

  public static toIEmailTemplate(entity: EmailTemplate): IEmailTemplate {
    return {
      id: entity.id,
      name: entity.name,
      subject: entity.subject ?? undefined,
      html: entity.html ?? undefined,
      text: entity.text ?? undefined,
      engine: entity.engine as EmailCompilerType,
      type: entity.type as EmailTemplateType,
      description: entity.description ?? undefined,
      module: entity.module ?? undefined,
      engineOptions:
        entity.engineOptions && typeof entity.engineOptions === 'object'
          ? (entity.engineOptions as JsonObject)
          : undefined,
      from: entity.from || undefined,
      cc: entity.cc ? (JSON.parse(entity.cc) as string[]) : [],
      bcc: entity.bcc ? (JSON.parse(entity.bcc) as string[]) : [],
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}

/**
 * Store email templates using Prisma
 */
export const PrismaEmailTemplatePersistorPlugin: ModuleMetadata = {
  providers: [{ provide: EmailTemplateProvider, useClass: PrismaEmailTemplatePersistor }],
  exports: [EmailTemplateProvider],
};
