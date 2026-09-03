import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';

import { AdminUserAuthPasswordModule } from '~modules/admin/admins/auth/providers/local/password';

import { AdminConfig } from '../admin.config';
import { AdminUserAuthModule } from '../auth';
import { AdminUserModule } from '../user';
import { AdminUserAdminController } from './admin-user.admin.controller';
import { AdminUserAdminService } from './admin-user.admin.service';

/**
 * Admin user administration api
 */
@Module({
  providers: [AdminUserAdminService, getConfigFactory(AdminConfig)],
  controllers: [AdminUserAdminController],
  imports: [
    //
    AuthnModule.forFeature(),
    AdminUserModule,
    AdminUserAuthModule,
    AdminUserAuthPasswordModule,
  ],
})
export class AdminUserAdminModule {}
