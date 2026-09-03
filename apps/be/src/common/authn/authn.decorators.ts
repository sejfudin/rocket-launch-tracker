import { type ExecutionContext, applyDecorators, createParamDecorator } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { IAuthnIdentity, IAuthnProviderIdentity, IAuthnRequestUser } from './authn.types';

/**
 * Pull the AuthnIdentity from the request context
 */
export const AuthnIdentity = createParamDecorator(
  (namespace: string | undefined, ctx: ExecutionContext): IAuthnIdentity => {
    const req: { user: IAuthnRequestUser } = ctx.switchToHttp().getRequest();
    if (!req.user || !('userId' in req.user) || !('id' in req.user)) {
      throw new Error('Identity not found in request context');
    }
    if (namespace && req.user.namespace !== namespace) {
      throw new Error('Identity namespace mismatch');
    }
    return req.user as IAuthnIdentity;
  },
);

export const AuthnDecorators = [
  ApiBearerAuth('Authorization'),
  ApiUnauthorizedResponse({ description: 'Unauthorized' }),
];

export function ApiAuthn() {
  return applyDecorators(...AuthnDecorators);
}

/**
 * Pull the AuthnProviderIdentity from the request context
 */
export const AuthnProviderIdentity = createParamDecorator(
  (data: never, ctx: ExecutionContext): IAuthnProviderIdentity => {
    const req: { user: IAuthnRequestUser } = ctx.switchToHttp().getRequest();
    if (!req.user?.provider || !req.user.providerId) {
      throw new Error('Provider Identity not found in request context');
    }
    return req.user as IAuthnProviderIdentity;
  },
);
