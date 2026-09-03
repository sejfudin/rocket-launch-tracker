import { Injectable } from '@nestjs/common';

import { PrismaService } from '~database/prisma';
import { AuthnIdentity, Prisma } from '~database/prisma/client';
import { Transaction } from '~database/types';

import type { IAuthnIdentity, IAuthnIdentityCreate, IAuthnIdentityUpdate, IAuthnProviderData } from '../../authn.types';
import { AuthnIdentityPersistor } from '../../identity/authn-identity-persistor.abstract';

@Injectable()
export class PrismaAuthnIdentityPersistor implements AuthnIdentityPersistor {
  constructor(private readonly prismaService: PrismaService) {}

  private toIAuthnIdentity(authnIdentity: AuthnIdentity): IAuthnIdentity {
    return {
      id: authnIdentity.id,

      provider: authnIdentity.provider,
      providerId: authnIdentity.providerId,

      providerData: (authnIdentity.providerData ?? {}) as IAuthnProviderData,

      namespace: authnIdentity.namespace,
      userId: authnIdentity.userId,

      disabledAt: authnIdentity.disabledAt ?? undefined,
      validatedAt: authnIdentity.validatedAt ?? undefined,

      createdAt: authnIdentity.createdAt,
      updatedAt: authnIdentity.updatedAt,
    };
  }

  public async find(
    where: { id: string } | { provider: string; providerId: string; namespace: string },
    tx?: Prisma.TransactionClient,
  ): Promise<IAuthnIdentity | null> {
    if ('id' in where) {
      if (!where.id) {
        throw new Error('Id is required');
      }
    } else if ('provider' in where && 'providerId' in where && 'namespace' in where) {
      if (!where.provider || !where.providerId || !where.namespace) {
        throw new Error('Provider, providerId and namespace are required');
      }
    } else {
      throw new Error('Invalid where parameter');
    }
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnIdentity.findUnique({
      where: 'id' in where ? { id: where.id } : { namespace_provider_providerId: where },
    });
    return entity ? this.toIAuthnIdentity(entity) : null;
  }

  public async list(
    where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
      disabled?: boolean;
      validated?: boolean;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<IAuthnIdentity[]> {
    const client = tx ?? this.prismaService.client;
    const findWhere: Prisma.AuthnIdentityWhereInput = {};
    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case 'id':
        case 'provider':
        case 'providerId':
        case 'namespace':
        case 'userId':
          if (typeof value === 'string') {
            findWhere[key] = value;
          } else if (Array.isArray(value)) {
            findWhere[key] = { in: value };
          } else {
            throw new Error(`Invalid where parameter for ${key}: ${value}`);
          }
          break;
        case 'disabled':
          if (typeof value === 'boolean') {
            findWhere.disabledAt = value ? { not: null } : null;
          }
          break;
        case 'validated':
          if (typeof value === 'boolean') {
            findWhere.validatedAt = value ? { not: null } : null;
          }
          break;
        default:
          throw new Error('Invalid where parameter');
      }
    }

    if (Object.keys(findWhere).length === 0) {
      throw new Error('No where parameter provided');
    }

    const entities = await client.authnIdentity.findMany({
      where: findWhere,
    });

    return entities.map(this.toIAuthnIdentity);
  }

  public async create(data: IAuthnIdentityCreate, tx?: Prisma.TransactionClient): Promise<IAuthnIdentity> {
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnIdentity.create({ data });
    return this.toIAuthnIdentity(entity);
  }

  public async update(
    where: { id: string } | { provider: string; providerId: string; namespace: string },
    data: IAuthnIdentityUpdate,
    tx?: Prisma.TransactionClient,
  ): Promise<IAuthnIdentity> {
    if (!('id' in where) && !('provider' in where && 'providerId' in where)) {
      throw new Error('Invalid where parameter');
    }
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnIdentity.update({
      where: 'id' in where ? { id: where.id } : { namespace_provider_providerId: where },
      data,
    });
    return this.toIAuthnIdentity(entity);
  }

  public async delete(
    where: {
      id?: string | string[];
      provider?: string | string[];
      providerId?: string | string[];
      namespace?: string | string[];
      userId?: string | string[];
    },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService.client;
    const deleteWhere: Prisma.AuthnIdentityWhereInput = {};
    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case 'id':
        case 'provider':
        case 'providerId':
        case 'namespace':
        case 'userId':
          deleteWhere[key] = Array.isArray(value) ? { in: value } : value;
          break;
        default:
          throw new Error('Invalid where parameter');
      }
    }

    if (Object.keys(deleteWhere).length === 0) {
      throw new Error('No where parameter provided');
    }

    await client.authnIdentity.deleteMany({ where: deleteWhere });
    return;
  }

  withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.prismaService.client.$transaction((prisma) => {
      return fn(prisma);
    });
  }
}
