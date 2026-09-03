import { Injectable } from '@nestjs/common';

import { SettingsProvider } from './settings-provider.abstract';

@Injectable()
export class SettingsLoader {
  public providers: Record<string, SettingsProvider> = {};

  registerProvider(provider: SettingsProvider): void {
    if (provider.module in this.providers) {
      throw new Error(`Settings provider for module ${provider.module} already registered`);
    }
    this.providers[provider.module] = provider;
  }
}
