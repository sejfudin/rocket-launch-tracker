import { type IPagination } from '~common/http/pagination';

import {
  type IPushNotificationToken,
  type IPushNotificationTokenCreate,
  IPushNotificationTokenPaginationQuery,
} from './models';
import { IPushNotificationLabelsRequest } from './models/push-notification-labels.request';

export abstract class PushNotificationTokenPersistor {
  public abstract find(where: { id: string }): Promise<IPushNotificationToken | null>;

  public abstract list(options: {
    where: {
      id?: string | string[];
      resourceName?: string | string[];
      token?: string | string[];
      provider?: string | string[];
      expiresAt__gt?: Date;
      search?: string;
    };
    skip?: number;
    take?: number;
  }): Promise<IPushNotificationToken[]>;

  public abstract paginate(
    query: IPushNotificationTokenPaginationQuery,
    options?: { resourceName?: string },
  ): Promise<IPagination<IPushNotificationToken>>;

  public abstract create(data: IPushNotificationTokenCreate): Promise<IPushNotificationToken>;

  public abstract update(where: { id: string }, data: Partial<IPushNotificationToken>): Promise<IPushNotificationToken>;

  public abstract delete(where: {
    id?: string | string[];
    token?: string | string[];
    resourceName?: string | string[];
    expiresAt__lt?: Date;
  }): Promise<number>;

  public abstract listLabels(query: IPushNotificationLabelsRequest): Promise<{ id: string; label: string }[]>;
}
