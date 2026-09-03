import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';

import { UserAuthEmailModule } from '../email/user-auth-email.module';
import { UserAuthPasswordModule } from '../password/user-auth-password.module';
import { UserAuthForgotPasswordController } from './user-auth-forgot-password.controller';
import { UserAuthForgotPasswordEmailTemplates } from './user-auth-forgot-password.email-templates';
import { UserAuthForgotPasswordService } from './user-auth-forgot-password.service';

@Module({
  imports: [UserAuthModule, UserAuthPasswordModule, UserAuthEmailModule],
  controllers: [UserAuthForgotPasswordController],
  providers: [
    getConfigFactory(UserAuthConfig),
    getConfigFactory(CoreConfig),
    UserAuthForgotPasswordEmailTemplates,
    UserAuthForgotPasswordService,
  ],
})
export class UserAuthForgotPasswordModule {}
