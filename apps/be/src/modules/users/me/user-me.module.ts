import { Module } from '@nestjs/common';

import { UserModule } from '~modules/users/user';

import { UserMeController } from './user-me.controller';
import { UserMeService } from './user-me.service';

/**
 * Get and update own user data
 */
@Module({
  imports: [UserModule],
  controllers: [UserMeController],
  providers: [UserMeService],
})
export class UserMeModule {}
