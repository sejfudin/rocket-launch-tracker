import { Global, Module } from '@nestjs/common';

import { AdminUserService } from './admin-user.service';

@Global()
@Module({
  providers: [AdminUserService],
  exports: [AdminUserService],
})
export class AdminUserModule {}
