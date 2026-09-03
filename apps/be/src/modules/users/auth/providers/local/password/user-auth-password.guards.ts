import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { USER_AUTHN_PASSWORD_STRATEGY } from './user-auth-password.constants';

/**
 * Passportjs Password Strategy Guard
 */
export function UserPasswordGuard() {
  return applyDecorators(UseGuards(AuthGuard(USER_AUTHN_PASSWORD_STRATEGY)));
}
