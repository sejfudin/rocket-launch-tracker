import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthnModule } from '~common/authn';
import { getConfigFactory } from '~common/config';

import { ADMIN_USER_AUTHN_JWT_SERVICE, AdminUserAuthModule } from '~modules/admin/admins/auth';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';

import { AdminUserAuthJwtController } from './admin-user-auth-jwt.controller';
import { AdminUserAuthJwtService } from './admin-user-auth-jwt.service';
import { AdminUserAuthJwtStrategy } from './admin-user-auth-jwt.strategy';

@Module({
  imports: [AdminUserAuthModule, AuthnModule.forFeature()],
  controllers: [AdminUserAuthJwtController],
  providers: [
    getConfigFactory(AdminUserAuthConfig),
    {
      provide: ADMIN_USER_AUTHN_JWT_SERVICE,
      useFactory: (userAuthConfig: AdminUserAuthConfig) => {
        return new JwtService({
          secret: userAuthConfig.secret,
        });
      },
      inject: [AdminUserAuthConfig],
    },
    AdminUserAuthJwtStrategy,
    AdminUserAuthJwtService,
  ],
  exports: [AdminUserAuthJwtService],
})
export class AdminUserAuthJwtModule {}
