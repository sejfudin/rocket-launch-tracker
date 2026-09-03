import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { applyModulePlugins, deferComposableModule } from '~common/utils/nestjs';

import { PrismaConfig } from './prisma.config';
import { PrismaService } from './prisma.service.abstract';
import { PrismaSingletonService } from './prisma-singleton.service';

/**
 * Main database connection module
 *  all plugins will be global
 */
@Module({})
export class PrismaModule {
  static forRoot = deferComposableModule({
    module: PrismaModule,
    global: true,
    providers: [
      getConfigFactory(PrismaConfig),
      { provide: PrismaService, useClass: PrismaSingletonService },
      PrismaSingletonService,
    ],
    exports: [PrismaService],
  });

  /**
   * Return a new global module that depends on PrismaModule
   */
  static forFeature(plugins: ModuleMetadata[] | ModuleMetadata): DynamicModule {
    return applyModulePlugins(
      {
        global: true,
        // this works because nestjs computes a hash for dynamic modules
        module: PrismaModule,
      },
      [{ imports: [PrismaModule.forRoot()] }, ...(Array.isArray(plugins) ? plugins : [plugins])],
    );
  }
}
