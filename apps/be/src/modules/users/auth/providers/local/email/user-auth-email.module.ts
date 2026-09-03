import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';
import { EmailModule } from '~common/email';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';

import { UserAuthEmailService } from './user-auth-email.service';

@Module({
  imports: [UserAuthModule, EmailModule.forFeature(), AuthnModule.forFeature()],
  providers: [getConfigFactory(UserAuthConfig), getConfigFactory(CoreConfig), UserAuthEmailService],
  exports: [UserAuthEmailService],
})
export class UserAuthEmailModule {}
