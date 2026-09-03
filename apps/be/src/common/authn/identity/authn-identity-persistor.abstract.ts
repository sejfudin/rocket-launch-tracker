import { Transaction } from '~database/types';

import type { IAuthnIdentity, IAuthnIdentityCreate, IAuthnIdentityUpdate } from '../authn.types';

/**
 * Store identities
 *  this is a link between user modules and providers, it needs to be persisted
 */
export abstract class AuthnIdentityPersistor {
  public abstract find(
    where: { id: string } | { provider: string; providerId: string; namespace: string },
    tx?: Transaction,
  ): Promise<IAuthnIdentity | null>;

  public abstract list(
    where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
      disabled?: boolean;
      validated?: boolean;
    },
    tx?: Transaction,
  ): Promise<IAuthnIdentity[]>;

  public abstract create(data: IAuthnIdentityCreate, tx?: Transaction): Promise<IAuthnIdentity>;

  public abstract update(
    where: { id: string } | { provider: string; providerId: string; namespace: string },
    data: IAuthnIdentityUpdate,
    tx?: Transaction,
  ): Promise<IAuthnIdentity>;

  public abstract delete(
    where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
    },
    tx?: Transaction,
  ): Promise<void>;

  public abstract withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
