import { ISettingsSection } from '~common/settings/models';

import { SettingsPopulate } from '../settings/settings-provider.abstract';
import { type IEmailData, type IEmailSendResponse } from './models';

/**
 * External service for sending emails
 */
export abstract class EmailProvider {
  abstract readonly name: string;
  abstract send(data: IEmailData): Promise<IEmailSendResponse>;
  abstract preprocess(data: IEmailData): Promise<IEmailData>;
  abstract getSettings?(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection>;
}
