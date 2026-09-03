import { Module } from '@nestjs/common';

import { SettingsLoader } from './settings.loader';
import { SettingsService } from './settings.service';

@Module({
  providers: [SettingsLoader, SettingsService],
  exports: [SettingsLoader, SettingsService],
})
export class SettingsModule {}
