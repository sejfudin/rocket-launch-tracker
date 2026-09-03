import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthGoogleController } from '~modules/users/auth/providers/google/user-auth-google.controller';
import { UserAuthGoogleService } from '~modules/users/auth/providers/google/user-auth-google.service';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';

import { UserAuthGoogleConfig } from './user-auth-google.config';
import { UserAuthGoogleStrategy } from './user-auth-google.strategy';

@Module({
  imports: [UserAuthModule, UserAuthJwtModule],
  controllers: [UserAuthGoogleController],
  providers: [
    UserAuthGoogleService,
    UserAuthGoogleStrategy,
    getConfigFactory(UserAuthGoogleConfig),
    getConfigFactory(CoreConfig),
    getConfigFactory(UserAuthConfig),
  ],
})
export class UserAuthGoogleModule {}
