import { Injectable, Optional } from '@nestjs/common';

import { EmailLoader } from '~common/email/email.loader';
import { EmailTemplateProvider } from '~common/email/email-template-provider.abstract';
import { EmailTemplateType, IEmailTemplate, IEmailTemplateCreate, IEmailTemplateUpdate } from '~common/email/models';
import { IEmailTemplatePaginationQuery } from '~common/email/models/email-template.pagination.request';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';

import { ILabelQuery, LabelResponse } from '~modules/admin/common/models';

@Injectable()
export class EmailCustomTemplateAdminService {
  constructor(
    private readonly emailLoader: EmailLoader,
    @Optional()
    private readonly emailTemplateProvider?: EmailTemplateProvider,
  ) {}

  /**
   * Paginate custom templates
   */
  async paginate(query: IEmailTemplatePaginationQuery): Promise<IPagination<IEmailTemplate>> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }

    return await this.emailTemplateProvider.paginate({
      ...query,
      filter: {
        ...query.filter,
        type: EmailTemplateType.CUSTOM,
      },
    });
  }

  async find(where: { name: string }): Promise<IEmailTemplate> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }
    const template = await this.emailTemplateProvider.find({ ...where, type: EmailTemplateType.CUSTOM });
    if (!template) {
      throw new NotFoundException('Email Template not found', { code: 'not-found' });
    }
    return template;
  }

  async create(data: IEmailTemplateCreate): Promise<IEmailTemplate> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }

    if (data.name in this.emailLoader.staticTemplates) {
      throw new BadRequestException('Custom templates can not be created with the same name as a system template', {
        code: 'custom-template-name-conflict',
      });
    }

    return this.emailTemplateProvider.create({ ...data, type: EmailTemplateType.CUSTOM });
  }

  async update(where: { name: string }, data: IEmailTemplateUpdate): Promise<IEmailTemplate> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }

    if (!(await this.find(where))) {
      throw new BadRequestException('Custom template not found', { code: 'not-found' });
    }

    const emailTemplate = await this.emailTemplateProvider.update({ ...where, type: EmailTemplateType.CUSTOM }, data);
    return emailTemplate;
  }

  async delete(where: { name: string }): Promise<void> {
    if (this.emailTemplateProvider) {
      await this.emailTemplateProvider.delete({ ...where, type: EmailTemplateType.CUSTOM });
      return;
    }
    throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
  }

  /**
   * Get names of custom templates
   */
  async listLabels(query: ILabelQuery): Promise<LabelResponse[]> {
    if (!this.emailTemplateProvider) {
      throw new InternalServerErrorException('Email Template Provider', { code: 'not-configured' });
    }

    return this.emailTemplateProvider.listLabels({
      type: EmailTemplateType.CUSTOM,
      search: query.search,
      limit: query.limit,
    });
  }
}
