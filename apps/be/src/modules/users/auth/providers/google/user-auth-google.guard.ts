import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthnException } from '~common/authn';

import { UserAuthGoogleConfig } from './user-auth-google.config';
import { USER_AUTHN_GOOGLE_STRATEGY } from './user-auth-google.constants';

@Injectable()
export class UserAuthGoogleGuard extends AuthGuard(USER_AUTHN_GOOGLE_STRATEGY) {
  constructor(private readonly userAuthGoogleConfig: UserAuthGoogleConfig) {
    super();
  }
  canActivate(context: ExecutionContext) {
    if (!this.userAuthGoogleConfig.enabled) {
      throw new AuthnException('Google Auth is not enabled', { code: 'google-auth-disabled' });
    }
    return super.canActivate(context);
  }
}
