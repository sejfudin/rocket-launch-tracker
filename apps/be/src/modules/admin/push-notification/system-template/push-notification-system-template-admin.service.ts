import { Injectable, Optional } from '@nestjs/common';

import { BadRequestException, InternalServerErrorException, NotFoundException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import {
  IPushNotificationTemplate,
  IPushNotificationTemplateUpdate,
  PushNotificationTemplateStatus,
  PushNotificationTemplateType,
} from '~common/push-notifications/models';
import { PushNotificationLoader } from '~common/push-notifications/push-notification.loader';
import { PushNotificationTemplateProvider } from '~common/push-notifications/push-notification-template-provider.abstract';

import { IPushNotificationSystemTemplatePaginationQuery } from './models';

@Injectable()
export class PushNotificationSystemTemplateAdminService {
  constructor(
    private readonly pushNotificationLoader: PushNotificationLoader,
    @Optional()
    private readonly pushNotificationTemplateProvider?: PushNotificationTemplateProvider,
  ) {}

  /**
   * Paginate system templates
   *  system templates get overwritten by persisted templates
   */
  async paginate(
    query: IPushNotificationSystemTemplatePaginationQuery,
  ): Promise<IPagination<IPushNotificationTemplate>> {
    const names = query.filter?.names ?? Object.keys(this.pushNotificationLoader.staticTemplates);

    // return persisted templates for system templates that exist in the database
    const templates = this.pushNotificationTemplateProvider
      ? (
          await this.pushNotificationTemplateProvider.list({
            names,
            type: PushNotificationTemplateType.SYSTEM,
            search: query.filter?.search || undefined,
            title: query.filter?.title || undefined,
          })
        ).reduce(
          (acc, t) => {
            acc[t.name] = {
              ...Object.fromEntries(Object.entries(t).filter(([, v]) => !!v)),
              status: PushNotificationTemplateStatus.INVALID,
            } as IPushNotificationTemplate;
            return acc;
          },
          {} as Record<string, IPushNotificationTemplate>,
        )
      : {};

    for (const {
      templateOptions: { template },
    } of Object.values(this.pushNotificationLoader.staticTemplates)) {
      if (!names.includes(template.name)) {
        continue;
      }
      if (query.filter?.search && !template.name.includes(query.filter.search)) {
        continue;
      }

      if (templates[template.name]) {
        // override template
        templates[template.name].status = PushNotificationTemplateStatus.VALID;
        templates[template.name].params = template.params;
      } else {
        templates[template.name] = template;
      }
    }

    let items = Object.values(templates);

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
  async find(where: { name: string }): Promise<IPushNotificationTemplate> {
    const staticTemplate = this.pushNotificationLoader.staticTemplates[where.name];
    const overrideTemplate = this.pushNotificationTemplateProvider
      ? await this.pushNotificationTemplateProvider.find({ ...where, type: PushNotificationTemplateType.SYSTEM })
      : undefined;

    if (staticTemplate?.templateOptions.template) {
      if (overrideTemplate) {
        return {
          ...staticTemplate.templateOptions.template,
          ...overrideTemplate,
          status: PushNotificationTemplateStatus.VALID,
          params: staticTemplate.templateOptions.template.params,
        };
      }
      return { ...staticTemplate.templateOptions.template, status: PushNotificationTemplateStatus.VALID };
    } else if (overrideTemplate) {
      // the database has the system template but it does not exist locally
      // the template will still send manually but is not used by the system anymore
      return {
        ...overrideTemplate,
        status: PushNotificationTemplateStatus.INVALID,
      };
    }

    throw new NotFoundException('Push notification template not found', { code: 'not-found' });
  }

  async update(where: { name: string }, data: IPushNotificationTemplateUpdate): Promise<IPushNotificationTemplate> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }

    const persistedTemplate = await this.pushNotificationTemplateProvider.find({
      name: where.name,
    });

    if (!persistedTemplate) {
      return await this.pushNotificationTemplateProvider.create({
        ...data,
        name: where.name,
        type: PushNotificationTemplateType.SYSTEM,
      });
    } else if (persistedTemplate.type !== PushNotificationTemplateType.SYSTEM) {
      throw new BadRequestException('Push notification template is not a system template', {
        code: 'not-a-system-template',
      });
    }

    return await this.pushNotificationTemplateProvider.update(
      { ...where, type: PushNotificationTemplateType.SYSTEM },
      data,
    );
  }

  async delete(where: { name: string }): Promise<void> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }

    await this.pushNotificationTemplateProvider.delete({ ...where, type: PushNotificationTemplateType.SYSTEM });
  }
}
