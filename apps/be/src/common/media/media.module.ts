import { DynamicModule, Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';
import { SettingsModule } from '~common/settings';
import { deferComposableModule } from '~common/utils/nestjs';

import { MediaConfig } from './media.config';
import { MediaLoader } from './media.loader';
import { MediaService } from './media.service';
import { MediaSettingsProvider } from './media-settings.provider';

@Module({})
export class MediaModule {
  static forRoot = deferComposableModule({
    module: MediaModule,
    imports: [SettingsModule],
    providers: [
      MediaLoader,
      MediaService,
      getConfigFactory(MediaConfig),
      getConfigFactory(CoreConfig),
      MediaSettingsProvider,
    ],
    exports: [MediaService, MediaLoader],
  });

  static forFeature(): Promise<DynamicModule> {
    return this.forRoot();
  }
}
