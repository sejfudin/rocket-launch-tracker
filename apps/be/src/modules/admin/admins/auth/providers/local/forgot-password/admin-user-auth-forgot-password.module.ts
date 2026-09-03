import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { AdminUserAuthModule } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';
import { AdminUserAuthForgotPasswordController } from '~modules/admin/admins/auth/providers/local/forgot-password/admin-user-auth-forgot-password.controller';

import { AdminUserAuthEmailModule } from '../email/admin-user-auth-email.module';
import { AdminUserAuthPasswordModule } from '../password/admin-user-auth-password.module';
import { AdminUserAuthForgotPasswordEmailTemplates } from './admin-user-auth-forgot-password.email-templates';
import { AdminUserAuthForgotPasswordService } from './admin-user-auth-forgot-password.service';

@Module({
  imports: [AdminUserAuthModule, AdminUserAuthPasswordModule, AdminUserAuthEmailModule],
  controllers: [AdminUserAuthForgotPasswordController],
  providers: [
    getConfigFactory(AdminUserAuthConfig),
    getConfigFactory(CoreConfig),
    AdminUserAuthForgotPasswordEmailTemplates,
    AdminUserAuthForgotPasswordService,
  ],
})
export class AdminUserAuthForgotPasswordModule {}
