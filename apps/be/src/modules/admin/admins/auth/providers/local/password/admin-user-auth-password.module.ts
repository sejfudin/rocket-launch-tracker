import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';

import { AdminUserAuthModule } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';

import { AdminUserAuthJwtModule } from '../../jwt/admin-user-auth-jwt.module';
import { AdminUserAuthLocalPasswordController } from './admin-user-auth-password.controller';
import { AdminUserAuthPasswordService } from './admin-user-auth-password.service';
import { AdminUserAuthPasswordStrategy } from './admin-user-auth-password.strategy';

@Module({
  imports: [AdminUserAuthModule, AdminUserAuthJwtModule, AuthnModule.forFeature()],
  controllers: [AdminUserAuthLocalPasswordController],
  providers: [getConfigFactory(AdminUserAuthConfig), AdminUserAuthPasswordService, AdminUserAuthPasswordStrategy],
  exports: [AdminUserAuthPasswordService],
})
export class AdminUserAuthPasswordModule {}
