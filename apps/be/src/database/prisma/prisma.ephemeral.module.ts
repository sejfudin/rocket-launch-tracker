import { DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { applyModulePlugins, deferComposableModule } from '~common/utils/nestjs';

import { PrismaConfig } from './prisma.config';
import { PrismaService } from './prisma.service.abstract';
import { PrismaEphemeralService } from './prisma-ephemeral.service';

/**
 * Creates a new database for each invocation and remove it before shutdown
 */
@Module({})
export class PrismaEphemeralModule {
  static forRoot = deferComposableModule({
    module: PrismaEphemeralModule,
    global: true,
    providers: [
      getConfigFactory(PrismaConfig),
      { provide: PrismaService, useClass: PrismaEphemeralService },
      PrismaEphemeralService,
    ],
    exports: [PrismaService],
  });

  /**
   * Return a new global module that depends on PrismaEphemeralModule
   */
  static forFeature(plugins: ModuleMetadata[] | ModuleMetadata): DynamicModule {
    return applyModulePlugins(
      {
        global: true,
        // this works because nestjs computes a hash for dynamic modules
        module: PrismaEphemeralModule,
      },
      [{ imports: [PrismaEphemeralModule.forRoot()] }, ...(Array.isArray(plugins) ? plugins : [plugins])],
    );
  }
}
