import { PureAbility } from '@casl/ability';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UseGuards,
  applyDecorators,
  createParamDecorator,
  mixin,
} from '@nestjs/common';
import { ApiExtension, ApiForbiddenResponse } from '@nestjs/swagger';

import { IAuthnRequestUser } from '~common/authn';
import type { JsonObject } from '~common/types';

import { AuthzService } from './authz.service';
import { IAuthzPermission } from './authz.types';

const PermConditionRegex = /^\$(?<type>body|query|param)\.(?<path>.+)$/;

export const AclGuard = (permissions: IAuthzPermission[] | null) => {
  @Injectable()
  class AclGuardMixin implements CanActivate {
    constructor(public readonly authzService: AuthzService) {}
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
      const req: {
        authzAbility: PureAbility;
        user: IAuthnRequestUser;
        body: JsonObject;
        query: Record<string, string>;
        params: Record<string, string>;
      } = ctx.switchToHttp().getRequest();

      if (!permissions || permissions.length < 1) {
        throw new Error('No permissions set for endpoint');
      }

      if (!req.user || !('userId' in req.user)) {
        throw new Error('Auth not found in request context');
      }

      const ability = await this.authzService.generateAbilities({ user: req.user });

      req.authzAbility = ability;

      return this.authzService.checkPermissions(
        permissions.map(({ action, subject, conditions }) => {
          return {
            action,
            subject,
            // use the request as a context for checking permissions
            conditions: conditions
              ? Object.fromEntries(
                  Object.entries(conditions).map(([k, v]) => {
                    if (typeof v === 'string') {
                      const match = PermConditionRegex.exec(v);
                      if (match && match.groups) {
                        const { type, path } = match.groups;
                        // Use switch-case to choose the source based on the type
                        switch (type) {
                          case 'body':
                            if (req.body) {
                              const keys = path.split('.');
                              // oxlint-disable-next-line no-explicit-any, no-unsafe-member-access
                              return [k, keys.reduce((acc: any, key) => acc?.[key], req.body)];
                            }
                            break;
                          case 'query':
                            if (req.query) {
                              return [k, req.query?.[path]];
                            }
                            break;
                          case 'param':
                            if (req.params) {
                              return [k, req.query?.[path]];
                            }
                            break;
                          default:
                            throw new Error(`Unsupported type: ${type}`);
                        }
                      }
                    }
                    return [k, v];
                  }),
                )
              : undefined,
          };
        }),
        ability,
      );
    }
  }
  return mixin(AclGuardMixin);
};

export function AclCheckDecorators(
  permsOrSubjectAction?: IAuthzPermission | IAuthzPermission[] | Array<[string, JsonObject?]> | string,
  conditions?: Record<string, string>,
) {
  let permissions: IAuthzPermission[] | null = null;
  if (permsOrSubjectAction) {
    if (typeof permsOrSubjectAction === 'string') {
      const [subject, action] = permsOrSubjectAction.split(':');
      permissions = [{ subject, action, conditions }];
    } else {
      if (conditions) {
        throw new Error('Invalid permissions definition');
      }
      if (Array.isArray(permsOrSubjectAction)) {
        permissions = permsOrSubjectAction.map((x) => {
          if (Array.isArray(x)) {
            const [subject, action] = x[0].split(':');
            return {
              subject,
              action,
              conditions: x[1] as Record<string, string> | undefined,
            } satisfies IAuthzPermission;
          }
          return x;
        });
      } else if (
        typeof permsOrSubjectAction === 'object' &&
        permsOrSubjectAction.action &&
        permsOrSubjectAction.subject
      ) {
        permissions = [permsOrSubjectAction];
      } else {
        throw new Error('Invalid permissions');
      }
    }
  }

  return [
    UseGuards(AclGuard(permissions)),
    ApiExtension('x-acl', permissions),
    ApiForbiddenResponse({ description: 'Forbidden' }),
  ];
}

/**
 * Check the request against ACL permissions, requiring at least one
 *  @example AclCheck('banana:read', { plant: '$query.filter.plant' })
 *  @example AclCheck([['banana:read', { plant: '$query.filter.plant' }]])
 */
export function AclCheck(...aclParams: Parameters<typeof AclCheckDecorators>) {
  return applyDecorators(...AclCheckDecorators(...aclParams));
}

/**
 * Pull the AuthnIdentity from the request context
 */
export const AuthzAbility = createParamDecorator((_: undefined, ctx: ExecutionContext): PureAbility => {
  const req: { authzAbility: PureAbility } = ctx.switchToHttp().getRequest();

  if (!req.authzAbility) {
    throw new Error('Abilities not found in context');
  }

  return req.authzAbility;
});
