import { Module } from '@nestjs/common';

import { AuthnModule } from '~common/authn';

import { UserAuthModule } from '~modules/users/auth';
import { UserAuthPasswordModule } from '~modules/users/auth/providers/local/password';
import { UserModule } from '~modules/users/user';

import { UserAdminController } from './user-admin.controller';

/**
 * Admin user administration api
 */
@Module({
  controllers: [UserAdminController],
  imports: [AuthnModule.forFeature(), UserModule, UserAuthModule, UserAuthPasswordModule],
})
export class UserAdminModule {}
