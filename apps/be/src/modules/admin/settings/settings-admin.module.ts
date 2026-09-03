import { Module } from '@nestjs/common';

import { SettingsModule } from '~common/settings';

import { SettingsAdminController } from './settings-admin.controller';

@Module({
  imports: [SettingsModule],
  controllers: [SettingsAdminController],
})
export class SettingsAdminModule {}
