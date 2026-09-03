import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthnDecorators } from '~common/authn';

import { ADMIN_USER_AUTHN_JWT_STRATEGY } from './admin-user-auth-jwt.constants';

/**
 * Check if the user is authenticated with the JWT strategy
 */
export function AdminUserAuthJwtGuard() {
  return applyDecorators(UseGuards(AuthGuard(ADMIN_USER_AUTHN_JWT_STRATEGY)), ...AuthnDecorators);
}
