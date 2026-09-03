import { CanActivate, ExecutionContext, Injectable, UseGuards, applyDecorators, mixin } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiExtension, ApiForbiddenResponse } from '@nestjs/swagger';

import { AuthnDecorators, IAuthnIdentity } from '~common/authn';
import { type AclCheck, AclCheckDecorators } from '~common/authz';
import { ForbiddenException } from '~common/exceptions';

import { ADMIN_USER_AUTHN_JWT_STRATEGY } from './providers/jwt/admin-user-auth-jwt.constants';
import { AdminUserAuthJwtGuard } from './providers/jwt/admin-user-auth-jwt.guards';

/**
 * Check if the user authentication method is valid
 */
export const AuthenticatedAdminUser = AdminUserAuthJwtGuard;

const AdminUserAuthnGuards = UseGuards(AuthGuard(ADMIN_USER_AUTHN_JWT_STRATEGY));

export function AdminUserCheck() {
  return applyDecorators(AdminUserAuthnGuards, ...AuthnDecorators);
}

/**
 * Check if the identity is valid and they have matching ACL permissions
 */
export function AdminUserAclCheck(...aclParams: Parameters<typeof AclCheck>) {
  return applyDecorators(AdminUserAuthnGuards, ...AclCheckDecorators(...aclParams), ...AuthnDecorators);
}

/**
 * Protect a route with a user role (one must match)
 */
export const AdminUserRoleGuard = (roles: string | string[]) => {
  @Injectable()
  class UserGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request: { user: IAuthnIdentity & { roles: string[] } } = context.switchToHttp().getRequest();
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
export function AdminUserRoleCheck(...roleParams: Parameters<typeof AdminUserRoleGuard>) {
  return applyDecorators(
    AdminUserAuthnGuards,
    UseGuards(AdminUserRoleGuard(...roleParams)),
    ApiExtension('x-roles', Array.isArray(roleParams) ? roleParams : [roleParams]),
    ApiForbiddenResponse({ description: 'Forbidden' }),
    ...AuthnDecorators,
  );
}
