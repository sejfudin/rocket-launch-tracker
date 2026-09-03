import { Module } from '@nestjs/common';

import { AdminUserModule } from '../user';
import { AdminUserMeController } from './admin-user-me.controller';

@Module({
  imports: [AdminUserModule],
  controllers: [AdminUserMeController],
})
export class AdminUserMeModule {}
