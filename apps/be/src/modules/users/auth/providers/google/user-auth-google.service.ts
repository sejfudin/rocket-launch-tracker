import { Injectable } from '@nestjs/common';

import { IAuthnIdentity, IAuthnRequestUser } from '~common/authn';

import { UserAuthService } from '../../user-auth.service';

@Injectable()
export class UserAuthGoogleService {
  constructor(private readonly userAuthService: UserAuthService) {}

  /**
   * Self-registration with Google Auth
   */
  async login(data: IAuthnRequestUser): Promise<{ authnIdentity: IAuthnIdentity }> {
    return await this.userAuthService.upsert(
      {
        provider: 'google',
        providerId: data.providerId,
        providerData: data.providerData!,
      },
      { name: data.providerData!.name!, email: data.providerData!.email! },
    );
  }
}
