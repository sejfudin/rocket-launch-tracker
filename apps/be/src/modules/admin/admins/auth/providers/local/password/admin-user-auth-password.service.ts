import { Injectable } from '@nestjs/common';

import { hash } from '~common/utils/hash/hash';

import { AdminUserAuthService } from '../../../admin-user-auth.service';
import { AdminUserAuthPasswordChangeRequest } from './models/admin-user-auth-password-change.request';
import { AdminUserAuthPasswordRegisterRequest } from './models/admin-user-auth-password-register.request';

@Injectable()
export class AdminUserAuthPasswordService {
  constructor(private readonly userAuthService: AdminUserAuthService) {}

  async create(data: AdminUserAuthPasswordRegisterRequest) {
    const { password, ...userData } = data;
    return await this.userAuthService.create(
      {
        provider: 'local',
        providerId: data.email.trim().toLowerCase(),
        providerData: {
          password: hash(password),
        },
      },
      userData,
    );
  }

  async changePassword(
    where: { id: string } | { provider: string; providerId: string; userId: string },
    data: AdminUserAuthPasswordChangeRequest,
  ): Promise<void> {
    await this.userAuthService.update(where, {
      providerData: { password: hash(data.password) },
    });
  }
}
