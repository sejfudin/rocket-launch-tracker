import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthnDecorators } from '~common/authn';

import { USER_AUTHN_JWT_STRATEGY } from './user-auth-jwt.constants';

/**
 * Check if the user is authenticated with the JWT strategy
 */
export function UserAuthJwtGuard() {
  return applyDecorators(UseGuards(AuthGuard(USER_AUTHN_JWT_STRATEGY)), ...AuthnDecorators);
}
