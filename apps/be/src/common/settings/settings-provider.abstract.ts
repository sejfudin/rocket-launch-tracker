import { ISettingsModule } from '~common/settings/models';

export enum SettingsPopulate {
  Items = 'items',
  Sections = 'sections',
}

export abstract class SettingsProvider {
  abstract readonly module: string;

  abstract getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsModule>;
}
