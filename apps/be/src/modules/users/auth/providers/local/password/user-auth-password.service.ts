import { Injectable } from '@nestjs/common';

import { hash } from '~common/utils/hash/hash';

import { UserAuthService } from '../../../user-auth.service';
import { UserAuthPasswordChangeRequest } from './models/user-auth-password-change.request';
import { UserAuthPasswordRegisterRequest } from './models/user-auth-password-register.request';

@Injectable()
export class UserAuthPasswordService {
  constructor(private readonly userAuthService: UserAuthService) {}

  /**
   * Self-registration with a password
   */
  async register(data: UserAuthPasswordRegisterRequest) {
    const { password, ...userData } = data;
    return await this.userAuthService.register(
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
    data: UserAuthPasswordChangeRequest,
  ): Promise<void> {
    await this.userAuthService.update(where, {
      providerData: { password: hash(data.password) },
    });
  }
}
