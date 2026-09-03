import { ISettingsSection, SettingsPopulate } from '~common/settings';

import type { IPushNotificationMessage, IPushNotificationMessageResponse } from './models';

export abstract class PushNotificationProvider {
  public abstract sendMessage(message: IPushNotificationMessage): Promise<IPushNotificationMessageResponse[]>;
  public abstract validate<T extends { token: string }>(data: T): Promise<T & { expiresAt?: Date }>;
  public abstract getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection>;
}
