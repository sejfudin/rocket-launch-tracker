import { Get, Param, Query } from '@nestjs/common';

import { SettingsService } from '~common/settings';
import { SettingsModuleResponse, SettingsSectionResponse } from '~common/settings/models';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';

import { SettingsAdminFilterDto } from './models/settings-admin-filter.request';

@AdminController('settings', { tags: ['Settings Admin'] })
export class SettingsAdminController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @AdminUserAclCheck('settings:read')
  async list(@Query() query: SettingsAdminFilterDto): Promise<SettingsSectionResponse[]> {
    return (await this.settingsService.list({ populate: query.populate })).map((section) =>
      SettingsSectionResponse.fromDomain(section),
    );
  }

  @Get(':module')
  @AdminUserAclCheck('settings:read')
  async find(@Param('module') module: string, @Query() query: SettingsAdminFilterDto): Promise<SettingsModuleResponse> {
    return SettingsModuleResponse.fromDomain(await this.settingsService.find({ module }, { populate: query.populate }));
  }
}
