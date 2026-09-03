import { Transaction } from '~database/types';

import { type IAuthnNonce, type IAuthnNonceCreate, type IAuthnNonceUpdate } from '../authn.types';

/**
 * Store identities
 *  this is a link between user modules and providers, it needs to be persisted
 */
export abstract class AuthnNoncePersistor {
  public abstract find(
    where: { id: string; type: string; authId?: string; used?: boolean; expired?: boolean },
    tx?: Transaction,
  ): Promise<IAuthnNonce | null>;

  public abstract findRecent(authId: string, type: string, since: Date, tx?: Transaction): Promise<IAuthnNonce | null>;

  public abstract create(data: IAuthnNonceCreate, tx?: Transaction): Promise<IAuthnNonce>;

  public abstract update(where: { id: string }, data: IAuthnNonceUpdate, tx?: Transaction): Promise<IAuthnNonce>;

  public abstract decrementAttempts(id: string, tx?: Transaction): Promise<IAuthnNonce>;

  public abstract delete(
    where: {
      id?: string | string[];
      authId?: string | string[];
      type?: string | string[];
      used?: boolean;
      expired?: boolean;
    },
    tx?: Transaction,
  ): Promise<void>;

  public abstract withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
