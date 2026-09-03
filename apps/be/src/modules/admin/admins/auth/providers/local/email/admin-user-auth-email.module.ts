import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';
import { EmailModule } from '~common/email';

import { AdminUserAuthModule } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';
import { AdminUserAuthEmailService } from '~modules/admin/admins/auth/providers/local/email/admin-user-auth-email.service';

@Module({
  imports: [AdminUserAuthModule, EmailModule.forFeature(), AuthnModule.forFeature()],
  providers: [getConfigFactory(AdminUserAuthConfig), getConfigFactory(CoreConfig), AdminUserAuthEmailService],
  exports: [AdminUserAuthEmailService],
})
export class AdminUserAuthEmailModule {}
