import { type ModuleMetadata } from '@nestjs/common';

import { AuthnIdentityPersistor } from '~common/authn/identity/authn-identity-persistor.abstract';
import { AuthnNoncePersistor } from '~common/authn/nonce/authn-nonce-persistor.abstract';
import { PrismaAuthnNoncePersistor } from '~common/authn/persistors/prisma/prisma-authn-nonce.persistor';

import { PrismaAuthnIdentityPersistor } from './prisma-authn-identity.persistor';

/**
 * Store auth data using Prisma
 */
export const PrismaAuthnPersistorPlugin: ModuleMetadata = {
  providers: [
    { provide: AuthnIdentityPersistor, useClass: PrismaAuthnIdentityPersistor },
    { provide: AuthnNoncePersistor, useClass: PrismaAuthnNoncePersistor },
  ],
};
