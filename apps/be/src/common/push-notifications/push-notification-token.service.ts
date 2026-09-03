import { Injectable } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';

import { IPushNotificationToken, IPushNotificationTokenPaginationQuery } from './models';
import { IPushNotificationLabelsRequest } from './models/push-notification-labels.request';
import { PushNotificationConfig } from './push-notification.config';
import { PushNotificationLoader } from './push-notification.loader';
import { PushNotificationTokenPersistor } from './push-notification-token-persistor.abstract';

@Injectable()
export class PushNotificationTokenService {
  constructor(
    private readonly pushNotificationPersistor: PushNotificationTokenPersistor,
    private readonly loader: PushNotificationLoader,
    private readonly pushNotificationConfig: PushNotificationConfig,
  ) {}

  public async listToken(options: {
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
  }) {
    return this.pushNotificationPersistor.list(options);
  }

  public async paginateToken(
    query: IPushNotificationTokenPaginationQuery,
    options?: { resourceName?: string },
  ): Promise<IPagination<IPushNotificationToken>> {
    return this.pushNotificationPersistor.paginate(query, options);
  }

  public async registerToken(
    data: {
      resourceName: string;
      token: string;
      provider?: string;
      module?: string;
      resourceId?: string;
      resourceLabel?: string;
      title?: string;
    },
    options?: {
      // remove subscriptions for the token
      replace: boolean;
    },
  ) {
    if (options?.replace) {
      // remove old tokens if they exist
      await this.pushNotificationPersistor.delete({
        token: data.token,
      });
    }

    const provider = data.provider || this.pushNotificationConfig.defaultProvider;
    if (!provider) {
      throw new BadRequestException('Provider is required');
    }

    if (!(provider in this.loader.providers)) {
      throw new BadRequestException(`Provider '${provider}' not found`);
    }

    // validate the token
    const token = await this.loader.providers[provider].validate({
      ...data,
      provider,
    });

    return await this.pushNotificationPersistor.create(token);
  }

  public async deleteToken(where: {
    id?: string | string[];
    token?: string | string[];
    resourceName?: string | string[];
    expiresAt__lt?: Date;
  }): Promise<number> {
    return this.pushNotificationPersistor.delete(where);
  }

  public async listLabels(query: IPushNotificationLabelsRequest): Promise<{ id: string; label: string }[]> {
    return this.pushNotificationPersistor.listLabels(query);
  }
}
