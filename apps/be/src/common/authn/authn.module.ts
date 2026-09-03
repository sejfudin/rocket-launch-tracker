import { DynamicModule, Module } from '@nestjs/common';

import { deferComposableModule } from '~common/utils/nestjs';

import { AuthnIdentityService } from './identity/authn-identity.service';
import { AuthnNonceService } from './nonce/authn-nonce.service';

@Module({})
export class AuthnModule {
  static forRoot = deferComposableModule({
    module: AuthnModule,
    providers: [AuthnIdentityService, AuthnNonceService],
    exports: [AuthnIdentityService, AuthnNonceService],
  });

  static forFeature(): Promise<DynamicModule> {
    return this.forRoot();
  }
}
