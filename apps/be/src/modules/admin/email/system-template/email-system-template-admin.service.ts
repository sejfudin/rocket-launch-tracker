import { Injectable, Optional } from '@nestjs/common';

import { EmailLoader } from '~common/email/email.loader';
import { EmailTemplateProvider } from '~common/email/email-template-provider.abstract';
import { EmailTemplateStatus, EmailTemplateType, IEmailTemplate, IEmailTemplateUpdate } from '~common/email/models';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';

import { IEmailSystemTemplatePaginationQuery } from './models/email-system-template.pagination.request';

@Injectable()
export class EmailSystemTemplateAdminService {
  constructor(
    private readonly emailLoader: EmailLoader,
    @Optional()
    private readonly emailTemplateProvider?: EmailTemplateProvider,
  ) {}

  /**
   * Paginate system templates
   *  system templates get overwritten by persisted templates
   */
  async paginate(query: IEmailSystemTemplatePaginationQuery): Promise<IPagination<IEmailTemplate>> {
    const names = query.filter?.names ?? Object.keys(this.emailLoader.staticTemplates);

    // return persisted templates for system templates that exist in the database
    const templates = this.emailTemplateProvider
      ? (
          await this.emailTemplateProvider.list({
            names,
            type: EmailTemplateType.SYSTEM,
            engine: query.filter?.engine || undefined,
            search: query.filter?.search || undefined,
          })
        ).reduce(
          (acc, t) => {
            acc[t.name] = {
              ...Object.fromEntries(Object.entries(t).filter(([, v]) => !!v)),
              status: EmailTemplateStatus.INVALID,
            } as IEmailTemplate;
            return acc;
          },
          {} as Record<string, IEmailTemplate>,
        )
      : {};

    for (const {
      templateOptions: { template },
    } of Object.values(this.emailLoader.staticTemplates)) {
      if (!names.includes(template.name)) {
        continue;
      }
      if (query.filter?.search && !template.name.includes(query.filter.search)) {
        continue;
      }
      if (query.filter?.engine && template.engine !== query.filter.engine) {
        continue;
      }

      if (templates[template.name]) {
        // override template
        templates[template.name].status = EmailTemplateStatus.VALID;
        templates[template.name].params = template.params;
      } else {
        templates[template.name] = template;
      }
    }

    let items = Object.values(templates);
    if (query.filter?.isCustomized === false) {
      items = items.filter((item) => !item.updatedAt);
    } else if (query.filter?.isCustomized === true) {
      items = items.filter((item) => !!item.updatedAt);
    }

    items = items.filter((item) => {
      if (!query.filter?.updatedAt?.start || !query.filter?.updatedAt?.end) {
        return true;
      }
      // don't return static templates when filtering by updated date
      if (!item.updatedAt) {
        return false;
      }
      return item.updatedAt >= query.filter.updatedAt.start && item.updatedAt <= query.filter.updatedAt.end;
    });
    if (query.order?.length) {
      const { property, direction } = query.order[0];
      items = items.sort((a, b) => {
        if (!a[property]) {
          if (!b[property]) {
            return 0;
          }
          return direction === 'asc' ? 1 : -1;
        }
        if (!b[property]) {
          return direction === 'asc' ? -1 : 1;
        }
        return direction === 'asc'
          ? a[property].toString().localeCompare(b[property].toString())
          : b[property].toString().localeCompare(a[property].toString());
      });
    }

    return {
      items,
      // return all items always
      totalItems: items.length,
      limit: items.length,
      page: 1,
    };
  }

  /**
   * Find a system template
   *  override the static template with the persisted template if it exists
   */
  async find(where: { name: string }): Promise<IEmailTemplate> {
    const staticTemplate = this.emailLoader.staticTemplates[where.name];
    const overrideTemplate = this.emailTemplateProvider
      ? await this.emailTemplateProvider.find({ ...where, type: EmailTemplateType.SYSTEM })
      : undefined;

    if (staticTemplate?.templateOptions.template && typeof staticTemplate.templateOptions.template === 'object') {
      if (overrideTemplate) {
        return {
          ...staticTemplate.templateOptions.template,
          ...overrideTemplate,
          status: EmailTemplateStatus.VALID,
          params: staticTemplate.templateOptions.template.params,
        };
      }
      return { ...staticTemplate.templateOptions.template, status: EmailTemplateStatus.VALID };
    } else if (overrideTemplate) {
      // the database has the system template but it does not exist locally
      // the tempalte will still send manually but is not used by the system anymore
      return {
        ...overrideTemplate,
        status: EmailTemplateStatus.INVALID,
      };
    }

    throw new NotFoundException('Email Template not found', { code: 'not-found' });
  }

  async update(where: { name: string }, data: IEmailTemplateUpdate): Promise<IEmailTemplate> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }

    const persistedTemplate = await this.emailTemplateProvider.find({
      name: where.name,
    });
    const staticTemplate = this.emailLoader.staticTemplates[where.name];

    if (!persistedTemplate) {
      return await this.emailTemplateProvider.create({
        engine: staticTemplate.templateOptions.template.engine,
        ...data,
        name: where.name,
        type: EmailTemplateType.SYSTEM,
      });
    } else if (persistedTemplate.type !== EmailTemplateType.SYSTEM) {
      throw new BadRequestException('Email Template is not a system template', { code: 'not-a-system-template' });
    }

    return await this.emailTemplateProvider.update({ ...where, type: EmailTemplateType.SYSTEM }, data);
  }

  async delete(where: { name: string }): Promise<void> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }

    await this.emailTemplateProvider.delete({ ...where, type: EmailTemplateType.SYSTEM });
  }
}
