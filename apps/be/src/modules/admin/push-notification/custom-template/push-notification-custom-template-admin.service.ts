import { Injectable, Optional } from '@nestjs/common';

import { BadRequestException, InternalServerErrorException, NotFoundException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import {
  IPushNotificationTemplate,
  IPushNotificationTemplateCreate,
  IPushNotificationTemplatePaginationQuery,
  IPushNotificationTemplateUpdate,
  PushNotificationTemplateType,
} from '~common/push-notifications/models';
import { PushNotificationLoader } from '~common/push-notifications/push-notification.loader';
import { PushNotificationTemplateProvider } from '~common/push-notifications/push-notification-template-provider.abstract';

import { ILabelQuery, LabelResponse } from '~modules/admin/common/models';

@Injectable()
export class PushNotificationCustomTemplateAdminService {
  constructor(
    private readonly pushNotificationLoader: PushNotificationLoader,
    @Optional()
    private readonly pushNotificationTemplateProvider?: PushNotificationTemplateProvider,
  ) {}

  /**
   * Paginate custom templates
   */
  async paginate(query: IPushNotificationTemplatePaginationQuery): Promise<IPagination<IPushNotificationTemplate>> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }

    return await this.pushNotificationTemplateProvider.paginate({
      ...query,
      filter: {
        ...query.filter,
        type: PushNotificationTemplateType.CUSTOM,
      },
    });
  }

  async find(where: { name: string }): Promise<IPushNotificationTemplate> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }
    const template = await this.pushNotificationTemplateProvider.find({
      ...where,
      type: PushNotificationTemplateType.CUSTOM,
    });
    if (!template) {
      throw new NotFoundException('Push notification template not found', { code: 'not-found' });
    }
    return template;
  }

  async create(data: IPushNotificationTemplateCreate): Promise<IPushNotificationTemplate> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }

    if (data.name in this.pushNotificationLoader.staticTemplates) {
      throw new BadRequestException('Custom templates can not be created with the same name as a system template', {
        code: 'custom-template-name-conflict',
      });
    }

    return this.pushNotificationTemplateProvider.create({ ...data, type: PushNotificationTemplateType.CUSTOM });
  }

  async update(where: { name: string }, data: IPushNotificationTemplateUpdate): Promise<IPushNotificationTemplate> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }

    if (!(await this.find(where))) {
      throw new BadRequestException('Custom template not found', { code: 'not-found' });
    }

    const pushNotificationTemplate = await this.pushNotificationTemplateProvider.update(
      { ...where, type: PushNotificationTemplateType.CUSTOM },
      data,
    );
    return pushNotificationTemplate;
  }

  async delete(where: { name: string }): Promise<void> {
    if (this.pushNotificationTemplateProvider) {
      await this.pushNotificationTemplateProvider.delete({ ...where, type: PushNotificationTemplateType.CUSTOM });
      return;
    }
    throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
  }

  /**
   * Get names of custom templates
   */
  async listLabels(query: ILabelQuery): Promise<LabelResponse[]> {
    if (!this.pushNotificationTemplateProvider) {
      throw new InternalServerErrorException('Push Notification Template Provider', { code: 'not-configured' });
    }

    return this.pushNotificationTemplateProvider.listLabels({
      filter: {
        type: PushNotificationTemplateType.CUSTOM,
        search: query.search,
      },
      limit: query.limit ?? 20,
    });
  }
}
