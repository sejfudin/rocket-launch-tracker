import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthnException } from '~common/authn';

import { UserAuthAppleConfig } from './user-auth-apple.config';
import { USER_AUTHN_APPLE_STRATEGY } from './user-auth-apple.constants';

@Injectable()
export class UserAuthAppleGuard extends AuthGuard(USER_AUTHN_APPLE_STRATEGY) {
  constructor(private readonly userAuthAppleConfig: UserAuthAppleConfig) {
    super();
  }
  canActivate(context: ExecutionContext) {
    if (!this.userAuthAppleConfig.enabled) {
      throw new AuthnException('Apple Auth is not enabled', { code: 'apple-auth-disabled' });
    }
    return super.canActivate(context);
  }
}
