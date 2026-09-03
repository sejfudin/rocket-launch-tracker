import { Injectable } from '@nestjs/common';

import { Transaction } from '~database/types';

import { IAuthnIdentity, type IAuthnIdentityCreate, type IAuthnIdentityUpdate } from '../authn.types';
import { AuthnIdentityPersistor } from './authn-identity-persistor.abstract';

@Injectable()
export class AuthnIdentityService {
  constructor(private readonly authnIdentityPersistor: AuthnIdentityPersistor) {}

  public async find(
    where: { id: string } | { provider: string; providerId: string; namespace: string },
    tx?: Transaction,
  ): Promise<IAuthnIdentity | null> {
    return this.authnIdentityPersistor.find(where, tx);
  }

  public async create(data: IAuthnIdentityCreate, tx: Transaction): Promise<IAuthnIdentity> {
    return this.authnIdentityPersistor.create(data, tx);
  }

  public async list(
    where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
      disabled?: boolean;
    },
    tx?: Transaction,
  ): Promise<IAuthnIdentity[]> {
    return this.authnIdentityPersistor.list(where, tx);
  }

  public async update(
    where: { id: string } | { provider: string; providerId: string; namespace: string },
    data: IAuthnIdentityUpdate,
    tx?: Transaction,
  ): Promise<IAuthnIdentity> {
    return this.authnIdentityPersistor.update(where, data, tx);
  }

  public async delete(
    where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
    },
    tx?: Transaction,
  ): Promise<void> {
    return this.authnIdentityPersistor.delete(where, tx);
  }

  public async withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.authnIdentityPersistor.withTransaction(fn);
  }
}
