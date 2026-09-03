import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { AdminUserAuthModule } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';

import { AdminUserAuthJwtModule } from '../../jwt/admin-user-auth-jwt.module';
import { AdminUserAuthEmailModule } from '../email/admin-user-auth-email.module';
import { AdminUserAuthMagicLinkController } from './admin-user-auth-magic-link.controller';
import { UserAuthMagicLinkEmailTemplates } from './admin-user-auth-magic-link.email-templates';
import { AdminUserAuthMagicLinkService } from './admin-user-auth-magic-link.service';

@Module({
  imports: [AdminUserAuthModule, AdminUserAuthEmailModule, AdminUserAuthJwtModule],
  controllers: [AdminUserAuthMagicLinkController],
  providers: [
    getConfigFactory(AdminUserAuthConfig),
    getConfigFactory(CoreConfig),
    AdminUserAuthMagicLinkService,
    UserAuthMagicLinkEmailTemplates,
  ],
})
export class AdminUserAuthMagicLinkModule {}
