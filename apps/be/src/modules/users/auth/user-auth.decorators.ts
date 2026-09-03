import { CanActivate, ExecutionContext, Injectable, UseGuards, applyDecorators, mixin } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExtension, ApiForbiddenResponse } from '@nestjs/swagger';

import { AuthnDecorators, IAuthnIdentity } from '~common/authn';
import { type AclCheck, AclCheckDecorators } from '~common/authz';
import { ForbiddenException } from '~common/exceptions';

import { USER_AUTHN_JWT_STRATEGY } from '~modules/users/auth/providers/jwt/user-auth-jwt.constants';
import { UserRole } from '~modules/users/user/user.constants';

import { UserAuthJwtGuard } from './providers/jwt/user-auth-jwt.guards';

/**
 * Check if the user authentication method is valid
 */
export const AuthenticatedUser = UserAuthJwtGuard;

const UserAuthnGuards = UseGuards(AuthGuard(USER_AUTHN_JWT_STRATEGY));

export function UserCheck() {
  return applyDecorators(UserAuthnGuards, ...AuthnDecorators);
}

/**
 * Check if the identity is valid and they have matching ACL permissions
 */
export function UserAclCheck(...aclParams: Parameters<typeof AclCheck>) {
  return applyDecorators(UserAuthnGuards, ...AclCheckDecorators(...aclParams), ...AuthnDecorators);
}

/**
 * Protect a route with a user role (one must match)
 */
export const UserRoleGuard = (roles: UserRole[] | UserRole | string | string[]) => {
  @Injectable()
  class UserGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: { user: IAuthnIdentity & { roles: UserRole[] } } = context.switchToHttp().getRequest();
      if (!request.user) {
        throw new Error('Auth not found in request context');
      }
      if (!request.user.roles) {
        throw new ForbiddenException();
      }
      const _roles = Array.isArray(roles) ? roles : [roles];
      if (!request.user.roles.some((role) => _roles.includes(role))) {
        throw new ForbiddenException();
      }
      return true;
    }
  }
  return mixin(UserGuardMixin);
};

/**
 * Check if the user exists and has a certain role
 */
export function UserRoleCheck(...roleParams: Parameters<typeof UserRoleGuard>) {
  return applyDecorators(
    UserAuthnGuards,
    UseGuards(UserRoleGuard(...roleParams)),
    ApiExtension('x-roles', Array.isArray(roleParams) ? roleParams : [roleParams]),
    ApiForbiddenResponse({ description: 'Forbidden' }),
    ...AuthnDecorators,
  );
}
