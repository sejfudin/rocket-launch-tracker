import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthPasswordStrategy } from '~modules/users/auth/providers/local/password/user-auth-password.strategy';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';

import { UserAuthJwtModule } from '../../jwt/user-auth-jwt.module';
import { UserAuthLocalPasswordController } from './user-auth-password.controller';
import { UserAuthPasswordService } from './user-auth-password.service';

@Module({
  imports: [UserAuthModule, UserAuthJwtModule, AuthnModule.forFeature()],
  controllers: [UserAuthLocalPasswordController],
  providers: [getConfigFactory(UserAuthConfig), UserAuthPasswordService, UserAuthPasswordStrategy],
  exports: [UserAuthPasswordService],
})
export class UserAuthPasswordModule {}
