import {
  IEmailTemplateFilter,
  IEmailTemplatePaginationQuery,
} from '~common/email/models/email-template.pagination.request';
import { IPagination } from '~common/http/pagination';

import { EmailTemplateType, IEmailTemplate, IEmailTemplateCreate, IEmailTemplateUpdate } from './models';
import { IEmailTemplateLabelsRequest } from './models/email-template-labels.request';

export interface IEmailTemplateLabelFilters {
  search?: string;
  type?: EmailTemplateType;
  omit?: string[];
}

/**
 * Store and retrieve email templates
 */
export abstract class EmailTemplateProvider {
  public abstract find(where: { name: string; type?: EmailTemplateType }): Promise<IEmailTemplate | null>;
  public abstract paginate(query: IEmailTemplatePaginationQuery): Promise<IPagination<IEmailTemplate>>;
  public abstract list(filter: IEmailTemplateFilter): Promise<IEmailTemplate[]>;
  public abstract create(data: IEmailTemplateCreate): Promise<IEmailTemplate>;
  public abstract update(
    where: { name: string; type?: EmailTemplateType },
    data: IEmailTemplateUpdate,
  ): Promise<IEmailTemplate>;
  public abstract delete(where: { name: string; type?: EmailTemplateType }): Promise<void>;
  public abstract listLabels(query: IEmailTemplateLabelsRequest): Promise<{ id: string; label: string }[]>;
}
