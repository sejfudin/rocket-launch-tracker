import { Injectable } from '@nestjs/common';

import { IAuthnIdentity, IAuthnIdentityCreate, IAuthnIdentityUpdate } from '~common/authn';
import { AuthnIdentityService } from '~common/authn/identity';
import { BadRequestException, ConflictException } from '~common/exceptions';
import { makeUUID } from '~common/utils/short-uuid';

import { Transaction } from '~database/types';

import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';
import { IAdminUser } from '~modules/admin/admins/user';
import { AdminUserService } from '~modules/admin/admins/user/admin-user.service';
import { AdminUserCreateRequest } from '~modules/admin/admins/user/models/admin-user-create.request';

import { ADMIN_USER_AUTHN_KEY } from './admin-user-auth.constants';

@Injectable()
export class AdminUserAuthService {
  constructor(
    private readonly authnIdentityService: AuthnIdentityService,
    private readonly adminUserService: AdminUserService,
    private readonly adminUserAuthConfig: AdminUserAuthConfig,
  ) {}

  /**
   * Create admin identity and user
   */
  async create(
    auth: Pick<IAuthnIdentityCreate, 'provider' | 'providerId' | 'providerData'> & { userId?: string },
    userData: AdminUserCreateRequest,
  ): Promise<{ adminUser: IAdminUser; authnIdentity: IAuthnIdentity }> {
    return await this.authnIdentityService.withTransaction(async (tx: Transaction) => {
      if (
        await this.authnIdentityService.find(
          {
            provider: auth.provider,
            providerId: auth.providerId,
            namespace: ADMIN_USER_AUTHN_KEY,
          },
          tx,
        )
      ) {
        throw new ConflictException('Identity already exists', { code: 'identity-already-exists' });
      }
      const userId = auth.userId ?? makeUUID();
      if (await this.adminUserService.find({ id: userId }, tx)) {
        throw new BadRequestException('User already exists', 'user-already-exists');
      }
      const adminUser = await this.adminUserService.create(
        { ...userData, roles: userData?.roles ?? [], id: userId },
        tx,
      );
      const authnIdentity = await this.authnIdentityService.create(
        { ...auth, namespace: ADMIN_USER_AUTHN_KEY, userId },
        tx,
      );
      return { authnIdentity, adminUser };
    });
  }

  /**
   * Update authn identity
   */
  async update(
    where: { id: string } | { provider: string; providerId: string },
    data: IAuthnIdentityUpdate,
  ): Promise<IAuthnIdentity> {
    return await this.authnIdentityService.withTransaction(async (tx: Transaction) => {
      const authnIdentity = await this.authnIdentityService.find({ ...where, namespace: ADMIN_USER_AUTHN_KEY }, tx);
      if (!authnIdentity) {
        throw new BadRequestException('Identity not found');
      }

      return await this.authnIdentityService.update(
        { id: authnIdentity.id, namespace: ADMIN_USER_AUTHN_KEY },
        {
          ...data,
          providerData: {
            ...authnIdentity.providerData,
            ...data.providerData,
          },
        },
        tx,
      );
    });
  }

  async delete(where: { userId: string }): Promise<void> {
    return await this.authnIdentityService.withTransaction(async (tx: Transaction) => {
      // delete all user auth identities
      await this.authnIdentityService.delete({ userId: where.userId }, tx);

      await this.adminUserService.delete({ id: where.userId }, tx);
    });
  }

  buildRedirectUrl(data: { type: string; [key: string]: string | undefined }): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        params.set(key, value);
      }
    }

    return `${this.adminUserAuthConfig.redirectUrl}/?${params.toString()}`;
  }
}
