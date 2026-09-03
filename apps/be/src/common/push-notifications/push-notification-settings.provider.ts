import { Injectable, OnModuleInit } from '@nestjs/common';

import { PushNotificationLogDetail, PushNotificationMode } from '~common/push-notifications/models';
import { ISettingsModule, ISettingsSection, SettingsLoader, SettingsProvider, SettingsStatus } from '~common/settings';

import { SettingsPopulate } from '../settings/settings-provider.abstract';
import { PushNotificationConfig } from './push-notification.config';
import { PushNotificationLoader } from './push-notification.loader';

@Injectable()
export class PushNotificationSettingsProvider extends SettingsProvider implements OnModuleInit {
  readonly module = 'push-notification';

  constructor(
    private readonly pushNotificationLoader: PushNotificationLoader,
    private readonly pushNotificationConfig: PushNotificationConfig,
    private readonly settingsLoader: SettingsLoader,
  ) {
    super();
  }

  onModuleInit() {
    this.settingsLoader.registerProvider(this);
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsModule> {
    let providers: Record<string, ISettingsSection> = {};
    let status: SettingsStatus;
    let label: string = 'Push Notifications';
    let statusMessage: string | undefined;

    if (options.populate?.includes(SettingsPopulate.Sections)) {
      for (const [name, provider] of Object.entries(this.pushNotificationLoader.providers).filter(
        ([name, provider]) => !(name in providers) && 'getSettings' in provider && provider.getSettings,
      )) {
        providers[name] = await provider.getSettings!(options);
      }
    }

    if (this.pushNotificationConfig.mode === PushNotificationMode.DISABLED) {
      status = SettingsStatus.Disabled;
      statusMessage = 'Disabled';
    } else if (this.pushNotificationConfig.mode === PushNotificationMode.SUPPRESSED) {
      status = SettingsStatus.Warning;
      statusMessage = 'Suppressed';
    } else if (this.pushNotificationConfig.defaultProvider) {
      if (
        !(this.pushNotificationConfig.defaultProvider in this.pushNotificationLoader.providers) ||
        !this.pushNotificationLoader.providers[this.pushNotificationConfig.defaultProvider]?.getSettings
      ) {
        status = SettingsStatus.Error;
        statusMessage = `Default provider not configured`;
      } else {
        // the default provider takes over the status and label
        const provider =
          providers[this.pushNotificationConfig.defaultProvider] ||
          (await this.pushNotificationLoader.providers[this.pushNotificationConfig.defaultProvider].getSettings!(
            options,
          ));
        if (provider.label) label = provider.label;
        status = provider.status;
        statusMessage = provider.statusMessage;
      }
    } else {
      // multiple providers
      if (
        Object.keys(providers).length < 1 ||
        Object.values(providers).every((provider) => provider.status === SettingsStatus.Disabled)
      ) {
        status = SettingsStatus.Warning;
        statusMessage = 'No providers are configured';
      } else if (Object.values(providers).some((provider) => provider.status === SettingsStatus.Error)) {
        status = SettingsStatus.Error;
        statusMessage = 'Some providers have errors';
      } else if (Object.values(providers).every((provider) => provider.status === SettingsStatus.Ok)) {
        status = SettingsStatus.Ok;
        statusMessage = 'All providers are connected';
      } else {
        status = SettingsStatus.Warning;
        statusMessage = 'Some providers are not configured';
      }
    }

    const prefix = 'push-notification';
    return {
      name: prefix,
      label,
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: `${prefix}.logDetail`,
              label: 'Saving notification contents',
              value: this.pushNotificationConfig.logDetail === PushNotificationLogDetail.ADDRESS ? 'Off' : 'On',
            },
          ]
        : undefined,
      sections: options.populate?.includes(SettingsPopulate.Sections) ? Object.values(providers) : undefined,
    };
  }
}
