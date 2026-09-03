import { Injectable, type ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import type { IPushNotificationToken } from '../models';
import { PushNotificationTokenPersistor } from '../push-notification-token-persistor.abstract';

@Injectable()
export class NotImplementedPushNotificationTokenPersistor implements PushNotificationTokenPersistor {
  public async find(): Promise<IPushNotificationToken> {
    throw new Error('Method not implemented');
  }

  public async list(): Promise<IPushNotificationToken[]> {
    throw new Error('Method not implemented');
  }

  public async paginate(): Promise<IPagination<IPushNotificationToken>> {
    throw new Error('Method not implemented');
  }

  public async create(): Promise<IPushNotificationToken> {
    throw new Error('Method not implemented');
  }

  public async update(): Promise<IPushNotificationToken> {
    throw new Error('Method not implemented');
  }

  public async delete(): Promise<number> {
    throw new Error('Method not implemented');
  }

  public async listLabels(): Promise<{ id: string; label: string }[]> {
    throw new Error('Method not implemented');
  }
}

export const NotImplementedPushNotificationTokenPersistorPlugin: ModuleMetadata = {
  providers: [{ provide: PushNotificationTokenPersistor, useClass: NotImplementedPushNotificationTokenPersistor }],
};
