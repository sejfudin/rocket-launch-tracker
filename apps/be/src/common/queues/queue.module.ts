import { DynamicModule, Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { SettingsModule } from '~common/settings';
import { MetadataModule, deferComposableModule } from '~common/utils/nestjs';

import { QueueConfig } from './queue.config';
import { QueueExecutorService } from './queue.executor';
import { QueueLoader } from './queue.loader';
import { QueueService } from './queue.service';
import { QueueProvider } from './queue-provider.abstract';
import { QueueSettingsProvider } from './queue-settings.provider';

@Module({})
export class QueueModule {
  static forRoot = deferComposableModule({
    module: QueueModule,
    imports: [MetadataModule, SettingsModule],
    providers: [getConfigFactory(QueueConfig), QueueLoader, QueueService, QueueExecutorService, QueueSettingsProvider],
    exports: [QueueService, QueueLoader, QueueProvider],
  });

  static forFeature(): Promise<DynamicModule> {
    return this.forRoot();
  }
}
