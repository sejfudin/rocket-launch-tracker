import { Injectable, OnModuleInit } from '@nestjs/common';

import { ISettingsModule, SettingsLoader, SettingsProvider, SettingsStatus } from '~common/settings';

import { SettingsPopulate } from '../settings/settings-provider.abstract';
import { QueueConfig } from './queue.config';
import { QueueProvider } from './queue-provider.abstract';

@Injectable()
export class QueueSettingsProvider extends SettingsProvider implements OnModuleInit {
  readonly module = 'queue';

  constructor(
    private readonly queueProvider: QueueProvider,
    private readonly queueConfig: QueueConfig,
    private readonly settingsLoader: SettingsLoader,
  ) {
    super();
  }

  onModuleInit() {
    this.settingsLoader.registerProvider(this);
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsModule> {
    const providerSettings = this.queueProvider.getSettings ? await this.queueProvider.getSettings(options) : null;

    const prefix = 'queue';
    return {
      name: prefix,
      label: providerSettings?.label || 'Queue',
      status: providerSettings?.status || SettingsStatus.Warning,
      statusMessage: providerSettings?.statusMessage || 'No provider configured',
      items: undefined,
      sections:
        options.populate?.includes(SettingsPopulate.Sections) && providerSettings ? [providerSettings] : undefined,
    };
  }
}
