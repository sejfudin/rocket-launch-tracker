import { Injectable, Optional } from '@nestjs/common';

import {} from '~common/push-notifications';
import { PushNotificationTemplateType } from '~common/push-notifications/models';
import { PushNotificationLoader } from '~common/push-notifications/push-notification.loader';
import {
  IPushNotificationSendMessage,
  PushNotificationService,
} from '~common/push-notifications/push-notification.service';
import { PushNotificationTemplateProvider } from '~common/push-notifications/push-notification-template-provider.abstract';

import { ILabelQuery, LabelResponse } from '~modules/admin/common/models';

import { PushNotificationTemplateAdminSendRequest } from './models/push-notification-template-send-admin.request';

@Injectable()
export class PushNotificationAdminSendService {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
    private readonly pushNotificationLoader: PushNotificationLoader,
    @Optional()
    private readonly pushNotificationTemplateProvider?: PushNotificationTemplateProvider,
  ) {}
  async send(data: IPushNotificationSendMessage) {
    await this.pushNotificationService.send(data);
  }

  async sendTemplate(data: PushNotificationTemplateAdminSendRequest): Promise<void> {
    await this.pushNotificationService.send(data.toDomain());
  }

  /**
   * Get names of templates
   *  - search in static templates then add custom templates
   *  - return at most 40 labels
   */
  async listLabels(filter: ILabelQuery): Promise<LabelResponse[]> {
    let names = Object.values(this.pushNotificationLoader.staticTemplates).map((s) => s.templateOptions.template.name);

    if (filter.search) {
      names = names.filter((s) => s.includes(filter.search!));
    }

    if (!this.pushNotificationTemplateProvider || names.length >= 40) {
      return names.slice(0, 40).map((s) => ({ id: s, label: s }));
    }

    const customNames = await this.pushNotificationTemplateProvider.listLabels({
      filter: {
        type: PushNotificationTemplateType.CUSTOM,
        search: filter.search,
        omit: names,
      },
      limit: 40 - names.length,
    });

    return [...names.map((s) => ({ id: s, label: s })), ...customNames];
  }
}
