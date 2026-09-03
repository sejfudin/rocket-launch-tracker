import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';

import { applyModulePlugins, deferComposableModule } from '~common/utils/nestjs';

import { AuthzLoader } from './authz.loader';
import { AuthzService } from './authz.service';

@Module({})
export class AuthzModule {
  static forRoot = deferComposableModule({
    global: true,
    module: AuthzModule,
    providers: [AuthzLoader, AuthzService],
    exports: [AuthzService, AuthzLoader],
  });

  static forFeature(plugins: ModuleMetadata[] | ModuleMetadata): DynamicModule {
    return applyModulePlugins(
      {
        global: true,
        module: AuthzModule,
      },
      [{ imports: [AuthzModule.forRoot()] }, ...(Array.isArray(plugins) ? plugins : [plugins])],
    );
  }
}
