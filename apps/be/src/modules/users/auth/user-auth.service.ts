import { Injectable } from '@nestjs/common';

import { IAuthnIdentity, IAuthnIdentityCreate, IAuthnIdentityUpdate } from '~common/authn';
import { AuthnIdentityService } from '~common/authn/identity';
import { BadRequestException, ConflictException } from '~common/exceptions';
import { makeUUID } from '~common/utils/short-uuid';

import { Transaction } from '~database/types';

import { IUser } from '~modules/users/user/models';
import { UserRegisterRequest } from '~modules/users/user/models/user-register.request';
import { UserRole } from '~modules/users/user/user.constants';
import { UserService } from '~modules/users/user/user.service';

import { UserAuthConfig } from './user-auth.config';
import { USER_AUTHN_KEY } from './user-auth.constants';

@Injectable()
export class UserAuthService {
  constructor(
    private readonly authnIdentityService: AuthnIdentityService,
    private readonly userService: UserService,
    private readonly userAuthConfig: UserAuthConfig,
  ) {}

  /**
   * Self-registration and user creation
   */
  async register(
    auth: Pick<IAuthnIdentityCreate, 'provider' | 'providerId' | 'providerData'> & { userId?: string },
    userData: UserRegisterRequest,
    data?: { roles?: UserRole[] },
  ): Promise<{ user: IUser; authnIdentity: IAuthnIdentity }> {
    return await this.authnIdentityService.withTransaction(async (tx: Transaction) => {
      if (
        await this.authnIdentityService.find(
          {
            provider: auth.provider,
            providerId: auth.providerId,
            namespace: USER_AUTHN_KEY,
          },
          tx,
        )
      ) {
        throw new ConflictException('Identity already exists', 'identity-already-exists');
      }
      const userId = auth.userId ?? makeUUID();
      if (await this.userService.find({ id: userId }, tx)) {
        throw new BadRequestException('User already exists', 'user-already-exists');
      }
      const user = await this.userService.create(
        { ...userData, roles: data?.roles ?? [UserRole.client], id: userId },
        tx,
      );
      const authnIdentity = await this.authnIdentityService.create({ ...auth, namespace: USER_AUTHN_KEY, userId }, tx);
      return { authnIdentity, user };
    });
  }

  async upsert(
    auth: Pick<IAuthnIdentityCreate, 'provider' | 'providerId' | 'providerData'> & { userId?: string },
    userData: UserRegisterRequest,
    data?: { roles?: UserRole[] },
  ): Promise<{ user?: IUser; authnIdentity: IAuthnIdentity }> {
    return await this.authnIdentityService.withTransaction(async (tx: Transaction) => {
      const authnIdentity = await this.authnIdentityService.find(
        {
          provider: auth.provider,
          providerId: auth.providerId,
          namespace: USER_AUTHN_KEY,
        },
        tx,
      );
      if (authnIdentity) {
        // identity already exists
        // todo, update provider data ?
        // todo, check if user exists?
        return { authnIdentity };
      }
      const userId = auth?.userId ?? makeUUID();
      if (await this.userService.find({ id: userId }, tx)) {
        throw new BadRequestException('User already exists', 'user-already-exists');
      }
      const user = await this.userService.create(
        { ...userData, roles: data?.roles ?? [UserRole.client], id: userId },
        tx,
      );
      return {
        authnIdentity: await this.authnIdentityService.create(
          {
            provider: auth.provider,
            providerId: auth.providerId,
            providerData: auth.providerData ?? {},
            namespace: USER_AUTHN_KEY,
            userId,
          },
          tx,
        ),
        user,
      };
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
      const authnIdentity = await this.authnIdentityService.find({ ...where, namespace: USER_AUTHN_KEY }, tx);
      if (!authnIdentity) {
        throw new BadRequestException('Identity not found');
      }

      return await this.authnIdentityService.update(
        { id: authnIdentity.id, namespace: USER_AUTHN_KEY },
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

      await this.userService.delete({ id: where.userId }, tx);
    });
  }

  async bulkDelete(where: { ids: string[] }) {
    for (const id of where.ids) {
      await this.delete({ userId: id });
    }
  }

  buildRedirectUrl(data: { type: string; [key: string]: string | undefined }): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        params.set(key, value);
      }
    }

    return `${this.userAuthConfig.redirectUrl}/?${params.toString()}`;
  }
}
