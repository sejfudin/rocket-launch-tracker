import { Injectable, type ModuleMetadata } from '@nestjs/common';

import { AuthnNoncePersistor } from '~common/authn/nonce';

import { Prisma } from '~database/prisma/generated/client';
import { Transaction } from '~database/types';

import {
  IAuthnIdentity,
  IAuthnIdentityCreate,
  IAuthnIdentityUpdate,
  IAuthnNonce,
  IAuthnNonceCreate,
  IAuthnNonceUpdate,
} from '../authn.types';
import { AuthnIdentityPersistor } from '../identity';

@Injectable()
export class NotImplementedAuthnPersistor implements AuthnIdentityPersistor {
  public find(
    _where: { id: string } | { provider: string; providerId: string; namespace: string },
    _tx?: Transaction,
  ): Promise<IAuthnIdentity | null> {
    throw new Error('Method not implemented.');
  }
  public list(
    _where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
      disabled?: boolean;
      validated?: boolean;
    },
    _tx?: Transaction,
  ): Promise<IAuthnIdentity[]> {
    throw new Error('Method not implemented.');
  }
  public create(_data: IAuthnIdentityCreate, _tx?: Transaction): Promise<IAuthnIdentity> {
    throw new Error('Method not implemented.');
  }
  public update(
    _where: { id: string } | { provider: string; providerId: string; namespace: string },
    _data: IAuthnIdentityUpdate,
    _tx?: Transaction,
  ): Promise<IAuthnIdentity> {
    throw new Error('Method not implemented.');
  }
  public delete(
    _where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
    },
    _tx?: Transaction,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public withTransaction<T>(_fn: (tx: Transaction) => Promise<T>): Promise<T> {
    throw new Error('Method not implemented.');
  }
}

@Injectable()
export class NotImplementedAuthnNoncePersistor implements AuthnNoncePersistor {
  public async find(
    _where: { id: string; type: string; authId?: string; used?: boolean; expired?: boolean },
    _tx?: Prisma.TransactionClient,
  ): Promise<IAuthnNonce | null> {
    throw new Error('Method not implemented.');
  }

  public async findRecent(
    _authId: string,
    _type: string,
    _since: Date,
    _tx?: Prisma.TransactionClient,
  ): Promise<IAuthnNonce | null> {
    throw new Error('Method not implemented.');
  }

  public async create(_data: IAuthnNonceCreate, _tx?: Prisma.TransactionClient): Promise<IAuthnNonce> {
    throw new Error('Method not implemented.');
  }

  public async update(
    _where: { id: string },
    _data: IAuthnNonceUpdate,
    _tx?: Prisma.TransactionClient,
  ): Promise<IAuthnNonce> {
    throw new Error('Method not implemented.');
  }

  public async decrementAttempts(_id: string, _tx?: Prisma.TransactionClient): Promise<IAuthnNonce> {
    throw new Error('Method not implemented.');
  }

  public async delete(
    _where: {
      id?: string | string[];
      authId?: string | string[];
      type?: string | string[];
      used?: boolean;
      expired?: boolean;
    },
    _tx?: Prisma.TransactionClient,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return fn(null);
  }
}

export const NotImplementedAuthnPersistorPlugin: ModuleMetadata = {
  providers: [
    { provide: AuthnIdentityPersistor, useClass: NotImplementedAuthnPersistor },
    { provide: AuthnNoncePersistor, useClass: NotImplementedAuthnNoncePersistor },
  ],
  exports: [AuthnIdentityPersistor],
};
