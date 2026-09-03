import { IPagination } from '~common/http/pagination';

import {
  IPushNotificationTemplate,
  IPushNotificationTemplateCreate,
  IPushNotificationTemplateUpdate,
  PushNotificationTemplateType,
} from './models';
import {
  IPushNotificationTemplateFilter,
  IPushNotificationTemplatePaginationQuery,
} from './models/push-notification-template.pagination.request';

export interface IPushNotificationTemplateLabelFilters {
  search?: string;
  type?: PushNotificationTemplateType;
  omit?: string[];
}

/**
 * Store and retrieve push notification templates
 */
export abstract class PushNotificationTemplateProvider {
  public abstract find(where: {
    name: string;
    type?: PushNotificationTemplateType;
  }): Promise<IPushNotificationTemplate | null>;
  public abstract paginate(
    query: IPushNotificationTemplatePaginationQuery,
  ): Promise<IPagination<IPushNotificationTemplate>>;
  public abstract list(filter: IPushNotificationTemplateFilter): Promise<IPushNotificationTemplate[]>;
  public abstract create(data: IPushNotificationTemplateCreate): Promise<IPushNotificationTemplate>;
  public abstract update(
    where: { name: string; type?: PushNotificationTemplateType },
    data: IPushNotificationTemplateUpdate,
  ): Promise<IPushNotificationTemplate>;
  public abstract delete(where: { name: string; type?: PushNotificationTemplateType }): Promise<void>;
  public abstract listLabels(query: {
    filter: IPushNotificationTemplateLabelFilters;
    limit: number;
  }): Promise<{ id: string; label: string }[]>;
}
