import { Injectable, OnModuleInit } from '@nestjs/common';

import { ISettingsModule, ISettingsSection, SettingsLoader, SettingsProvider, SettingsStatus } from '~common/settings';

import { SettingsPopulate } from '../settings/settings-provider.abstract';
import { MediaConfig } from './media.config';
import { MediaLoader } from './media.loader';

@Injectable()
export class MediaSettingsProvider extends SettingsProvider implements OnModuleInit {
  readonly module = 'media';

  constructor(
    private readonly mediaLoader: MediaLoader,
    private readonly mediaConfig: MediaConfig,
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
    let label: string = 'Media';
    let statusMessage: string | undefined;

    if (options.populate?.includes(SettingsPopulate.Sections)) {
      for (const [name, provider] of Object.entries(this.mediaLoader.providers).filter(
        ([name, provider]) => !(name in providers) && 'getSettings' in provider && provider.getSettings,
      )) {
        providers[name] = await provider.getSettings!(options);
      }
    }

    if (this.mediaConfig.defaultProvider) {
      if (
        !(this.mediaConfig.defaultProvider in this.mediaLoader.providers) ||
        !this.mediaLoader.providers[this.mediaConfig.defaultProvider]?.getSettings
      ) {
        status = SettingsStatus.Error;
        statusMessage = `Default provider not configured`;
      } else {
        // the default provider takes over the status and label
        const provider =
          providers[this.mediaConfig.defaultProvider] ||
          (await this.mediaLoader.providers[this.mediaConfig.defaultProvider].getSettings!(options));
        if (provider.label) label = provider.label;
        status = provider.status;
        statusMessage = provider.statusMessage;
      }
    } else if (
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

    let sections = options.populate?.includes(SettingsPopulate.Sections) ? Object.values(providers) : undefined;
    if (sections && this.mediaConfig.defaultProvider) {
      // default provider should be first
      const sectionIndex = sections?.findIndex((section) => section.name === this.mediaConfig.defaultProvider);
      if (sectionIndex !== undefined) sections.unshift(sections.splice(sectionIndex, 1)[0]);
    }

    const prefix = 'media';
    return {
      name: prefix,
      label,
      status,
      statusMessage,
      items: undefined,
      sections,
    };
  }
}
