import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { UserModule } from '~modules/users/user';

import { UserAuthAuthz } from './user-auth.authz';
import { UserAuthConfig } from './user-auth.config';
import { UserAuthService } from './user-auth.service';

@Module({
  imports: [UserModule, AuthnModule.forFeature()],
  providers: [UserAuthService, getConfigFactory(UserAuthConfig), getConfigFactory(CoreConfig), UserAuthAuthz],
  exports: [UserAuthService],
})
export class UserAuthModule {}
