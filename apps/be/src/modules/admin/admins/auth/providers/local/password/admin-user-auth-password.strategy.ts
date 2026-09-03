import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { IAuthnRequestIdentity } from '~common/authn';
import { AuthnIdentityService } from '~common/authn/identity';
import { BadRequestException, UnauthorizedException } from '~common/exceptions';
import { validateHash } from '~common/utils/hash/hash';

import { ADMIN_USER_AUTHN_KEY } from '../../../admin-user-auth.constants';
import { ADMIN_USER_AUTHN_LOCAL_PROVIDER } from '../admin-user-auth-local.constants';
import { USER_AUTHN_PASSWORD_STRATEGY } from './admin-user-auth-password.constants';

@Injectable()
export class AdminUserAuthPasswordStrategy extends PassportStrategy(Strategy, USER_AUTHN_PASSWORD_STRATEGY) {
  constructor(private authnIdentityService: AuthnIdentityService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<IAuthnRequestIdentity> {
    const authnIdentity = await this.authnIdentityService.find({
      provider: ADMIN_USER_AUTHN_LOCAL_PROVIDER,
      namespace: ADMIN_USER_AUTHN_KEY,
      providerId: email.toLowerCase().trim(),
    });

    if (!authnIdentity) {
      throw new BadRequestException('Identity not found', {
        code: 'identity-not-found',
      });
    }

    if (!authnIdentity.providerData?.password || typeof authnIdentity.providerData.password !== 'string') {
      // no password set or invalid password format
      throw new UnauthorizedException('Invalid credentials', { code: 'invalid-credentials' });
    }

    if (!validateHash(password, authnIdentity.providerData.password)) {
      // invalid password
      throw new UnauthorizedException('Invalid credentials', { code: 'invalid-credentials' });
    }

    if (authnIdentity.disabledAt) {
      throw new UnauthorizedException('Account is disabled', { code: 'account-disabled' });
    }

    return { ...authnIdentity, ident: `user:${authnIdentity.userId}` };
  }
}
