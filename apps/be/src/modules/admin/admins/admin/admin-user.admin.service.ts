import { Injectable } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';

import { AdminConfig } from '~modules/admin/admins/admin.config';
import { AdminUserAuthService } from '~modules/admin/admins/auth/admin-user-auth.service';
import { AdminUserAuthPasswordService } from '~modules/admin/admins/auth/providers/local/password/admin-user-auth-password.service';
import { AdminUserAuthPasswordRegisterRequest } from '~modules/admin/admins/auth/providers/local/password/models/admin-user-auth-password-register.request';

import { AdminUserAuthPasswordAndSecretRegisterRequest } from './models/admin-user-password-and-secret-register.request';

@Injectable()
export class AdminUserAdminService {
  constructor(
    private readonly adminUserAuthPasswordService: AdminUserAuthPasswordService,
    private readonly adminUserAuthService: AdminUserAuthService,
    private readonly adminConfig: AdminConfig,
  ) {}

  async createWithPassword(data: AdminUserAuthPasswordRegisterRequest) {
    return await this.adminUserAuthPasswordService.create(data);
  }

  async createWithPasswordAndSecret(data: AdminUserAuthPasswordAndSecretRegisterRequest) {
    const { secret, ...userData } = data;

    if (!this.adminConfig.createSecret) {
      throw new BadRequestException('Create admin with secret is disabled', 'create-with-secret-disabled');
    }

    if (!secret) {
      throw new BadRequestException('Secret is required', 'secret-required');
    }

    if (secret !== this.adminConfig.createSecret) {
      throw new BadRequestException('Invalid secret', 'invalid-secret');
    }

    return await this.adminUserAuthPasswordService.create(userData);
  }

  async delete(data: { userId: string }) {
    return await this.adminUserAuthService.delete(data);
  }

  async bulkDelete(data: { ids: string[] }): Promise<void> {
    for (const id of data.ids) {
      // TODO: actually bulk delete instead of loop
      await this.delete({ userId: id });
    }
  }
}
