import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthJwtStrategy } from '~modules/users/auth/providers/jwt/user-auth-jwt.strategy';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { USER_AUTHN_JWT_SERVICE } from '~modules/users/auth/user-auth.constants';
import { UserModule } from '~modules/users/user';

import { UserAuthJwtController } from './user-auth-jwt.controller';
import { UserAuthJwtService } from './user-auth-jwt.service';

@Module({
  imports: [UserAuthModule, UserModule, AuthnModule.forFeature()],
  controllers: [UserAuthJwtController],
  providers: [
    getConfigFactory(UserAuthConfig),
    {
      provide: USER_AUTHN_JWT_SERVICE,
      useFactory: (userAuthConfig: UserAuthConfig) => {
        return new JwtService({
          secret: userAuthConfig.secret,
        });
      },
      inject: [UserAuthConfig],
    },
    UserAuthJwtStrategy,
    UserAuthJwtService,
  ],
  exports: [UserAuthJwtService],
})
export class UserAuthJwtModule {}
