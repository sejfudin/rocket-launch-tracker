import { DynamicModule, Global, Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { deferComposableModule } from '~common/utils/nestjs';

import { ActivityConfig } from './activity.config';
import { ActivityService } from './activity.service';

@Global()
@Module({})
export class ActivityModule {
  static forRoot = deferComposableModule({
    module: ActivityModule,
    providers: [getConfigFactory(ActivityConfig), ActivityService],
    exports: [ActivityService],
    global: true,
  });

  static forFeature(): Promise<DynamicModule> {
    return this.forRoot();
  }
}
