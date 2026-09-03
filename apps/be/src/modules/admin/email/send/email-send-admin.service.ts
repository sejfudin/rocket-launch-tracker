import { Injectable, Optional } from '@nestjs/common';

import { EmailService } from '~common/email';
import { EmailLoader } from '~common/email/email.loader';
import { EmailTemplateProvider } from '~common/email/email-template-provider.abstract';
import { EmailTemplateType } from '~common/email/models';
import { JsonObject } from '~common/types';

import { ILabelQuery, LabelResponse } from '~modules/admin/common/models';

import { EmailTemplateSendAdminRequest } from './models/email-template-send-admin.request';

@Injectable()
export class EmailSendAdminService {
  constructor(
    private readonly emailLoader: EmailLoader,
    private readonly emailService: EmailService,
    @Optional()
    private readonly emailTemplateProvider?: EmailTemplateProvider,
  ) {}

  async sendTemplate(data: EmailTemplateSendAdminRequest): Promise<void> {
    const { templateName, templateVariables, provider, ...emailData } = data;
    await this.emailService.sendTemplate(
      { ...emailData, provider },
      templateName,
      templateVariables?.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.param]: curr.value,
        } as JsonObject;
      }, {} as JsonObject),
    );
  }

  /**
   * Get names of templates
   *  - search in static templates then add custom templates
   */
  async listLabels(query: ILabelQuery): Promise<LabelResponse[]> {
    const limit = query.limit ?? 20;
    let names = Object.values(this.emailLoader.staticTemplates).map((s) => s.templateOptions.template.name);

    if (query.search) {
      names = names.filter((s) => s.includes(query.search!));
    }

    if (!this.emailTemplateProvider || names.length >= limit) {
      return names.slice(0, limit).map((s) => ({ id: s, label: s }));
    }

    const customNames = await this.emailTemplateProvider.listLabels({
      type: EmailTemplateType.CUSTOM,
      search: query.search,
      omit: names,
      limit: limit - names.length,
    });

    return [...names.map((s) => ({ id: s, label: s })), ...customNames];
  }
}
