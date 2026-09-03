import { DynamicModule, Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { SettingsModule } from '~common/settings';
import { MetadataModule, deferComposableModule } from '~common/utils/nestjs';

import { PushNotificationConfig } from './push-notification.config';
import { PushNotificationLoader } from './push-notification.loader';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationSettingsProvider } from './push-notification-settings.provider';
import { PushNotificationTokenService } from './push-notification-token.service';

@Module({})
export class PushNotificationModule {
  static forRoot = deferComposableModule({
    module: PushNotificationModule,
    imports: [
      //
      MetadataModule,
      SettingsModule,
    ],
    providers: [
      //
      PushNotificationService,
      PushNotificationTokenService,
      PushNotificationLoader,
      getConfigFactory(PushNotificationConfig),
      PushNotificationSettingsProvider,
    ],
    exports: [PushNotificationService, PushNotificationLoader, PushNotificationTokenService],
  });

  static forFeature(): Promise<DynamicModule> {
    return this.forRoot();
  }
}
