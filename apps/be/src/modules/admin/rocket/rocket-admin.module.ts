import { Module } from '@nestjs/common';

import { RocketModule } from '~modules/rocket/rocket.module';

import { RocketAdminController } from './rocket-admin.controller';
import { RocketModelAdminController } from './rocket-model-admin.controller';

@Module({
  imports: [RocketModule],
  controllers: [RocketAdminController, RocketModelAdminController],
})
export class RocketAdminModule {}
