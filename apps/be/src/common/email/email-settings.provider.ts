import { Injectable, OnModuleInit } from '@nestjs/common';

import { EmailLogDetail, EmailMode } from '~common/email/models';
import {
  ISettingsModule,
  ISettingsSection,
  SettingsLoader,
  SettingsProvider,
  SettingsSettingAction,
  SettingsStatus,
} from '~common/settings';

import { SettingsPopulate } from '../settings/settings-provider.abstract';
import { EmailConfig } from './email.config';
import { EmailLoader } from './email.loader';

@Injectable()
export class EmailSettingsProvider extends SettingsProvider implements OnModuleInit {
  readonly module = 'email';

  constructor(
    private readonly emailLoader: EmailLoader,
    private readonly emailConfig: EmailConfig,
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
    let label: string = 'Email';
    let statusMessage: string | undefined;

    if (options.populate?.includes(SettingsPopulate.Sections)) {
      for (const [name, provider] of Object.entries(this.emailLoader.providers).filter(
        ([name, provider]) => !(name in providers) && 'getSettings' in provider && provider.getSettings,
      )) {
        providers[name] = await provider.getSettings!(options);
      }
    }

    if ([EmailMode.DISABLED, EmailMode.SUPPRESSED].includes(this.emailConfig.mode)) {
      status = SettingsStatus.Disabled;
      statusMessage = 'Disabled';
    } else if (this.emailConfig.defaultProvider) {
      if (
        !(this.emailConfig.defaultProvider in this.emailLoader.providers) ||
        !this.emailLoader.providers[this.emailConfig.defaultProvider]?.getSettings
      ) {
        status = SettingsStatus.Error;
        statusMessage = `Default provider not configured`;
      } else {
        // the default provider takes over the status and label
        const provider =
          providers[this.emailConfig.defaultProvider] ||
          (await this.emailLoader.providers[this.emailConfig.defaultProvider].getSettings!(options));
        if (provider.label) label = provider.label;
        status = provider.status;
        statusMessage = provider.statusMessage;
      }
    } else if (
      // multiple providers
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

    const prefix = 'email';
    return {
      name: prefix,
      label,
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: `${prefix}.defaultFrom`,
              label: 'Default From',
              value: this.emailConfig.defaultFrom,
              actions: [SettingsSettingAction.Copy],
            },
            {
              name: `${prefix}.logDetail`,
              label: 'Saving email contents',
              value: this.emailConfig.logDetail === EmailLogDetail.ADDRESS ? 'Off' : 'On',
            },
          ]
        : undefined,
      sections: options.populate?.includes(SettingsPopulate.Sections) ? Object.values(providers) : undefined,
    };
  }
}
