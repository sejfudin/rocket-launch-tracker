import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { CoreConfig } from '~common/core';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';

import { UserAuthAppleConfig } from './user-auth-apple.config';
import { UserAuthAppleController } from './user-auth-apple.controller';
import { UserAuthAppleService } from './user-auth-apple.service';
import { UserAuthAppleStrategy } from './user-auth-apple.strategy';

@Module({
  imports: [UserAuthModule, UserAuthJwtModule],
  controllers: [UserAuthAppleController],
  providers: [
    UserAuthAppleService,
    UserAuthAppleStrategy,
    getConfigFactory(UserAuthAppleConfig),
    getConfigFactory(CoreConfig),
    getConfigFactory(UserAuthConfig),
  ],
})
export class UserAuthAppleModule {}
