import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { AdminUserModule } from '../user';
import { AdminUserAuthAuthz } from './admin-user-auth.authz';
import { AdminUserAuthConfig } from './admin-user-auth.config';
import { AdminUserAuthService } from './admin-user-auth.service';

@Module({
  imports: [AdminUserModule, AuthnModule.forFeature()],
  providers: [
    AdminUserAuthService,
    getConfigFactory(AdminUserAuthConfig),
    getConfigFactory(CoreConfig),
    AdminUserAuthAuthz,
  ],
  exports: [AdminUserAuthService],
})
export class AdminUserAuthModule {}
