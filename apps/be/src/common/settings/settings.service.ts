import { Injectable } from '@nestjs/common';

import { ISettingsModule, ISettingsSection } from '~common/settings/models';

import { SettingsLoader } from './settings.loader';
import { SettingsPopulate } from './settings-provider.abstract';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsLoader: SettingsLoader) {}

  async list(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection[]> {
    return (
      await Promise.all(
        Object.values(this.settingsLoader.providers).map(
          async (provider) => await provider.getSettings({ populate: options.populate ?? [] }),
        ),
      )
    ).flat();
  }

  async find(filter: { module: string }, options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsModule> {
    if (!(filter.module in this.settingsLoader.providers)) {
      throw new Error(`Settings module ${filter.module} not found`);
    }
    return await this.settingsLoader.providers[filter.module].getSettings({ populate: options.populate ?? [] });
  }
}
