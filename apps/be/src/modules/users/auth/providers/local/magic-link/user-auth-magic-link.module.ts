import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';

import { UserAuthJwtModule } from '../../jwt/user-auth-jwt.module';
import { UserAuthEmailModule } from '../email/user-auth-email.module';
import { UserAuthMagicLinkController } from './user-auth-magic-link.controller';
import { UserAuthMagicLinkEmailTemplates } from './user-auth-magic-link.email-templates';
import { UserAuthMagicLinkService } from './user-auth-magic-link.service';

@Module({
  imports: [UserAuthModule, UserAuthEmailModule, UserAuthJwtModule],
  controllers: [UserAuthMagicLinkController],
  providers: [
    getConfigFactory(UserAuthConfig),
    getConfigFactory(CoreConfig),
    UserAuthMagicLinkService,
    UserAuthMagicLinkEmailTemplates,
  ],
})
export class UserAuthMagicLinkModule {}
