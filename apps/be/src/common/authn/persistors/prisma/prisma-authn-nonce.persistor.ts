import { Injectable } from '@nestjs/common';

import { IAuthnNonce, IAuthnNonceCreate, IAuthnNonceUpdate } from '~common/authn/authn.types';
import { AuthnNoncePersistor } from '~common/authn/nonce/authn-nonce-persistor.abstract';
import type { JsonObject } from '~common/types';

import { PrismaService } from '~database/prisma';
import { AuthnNonce, Prisma } from '~database/prisma/client';
import { Transaction } from '~database/types';

@Injectable()
export class PrismaAuthnNoncePersistor implements AuthnNoncePersistor {
  constructor(private readonly prismaService: PrismaService) {}

  private toIAuthnNonce(nonce: AuthnNonce): IAuthnNonce {
    return {
      id: nonce.id,

      authId: nonce.authId,
      type: nonce.type,

      hashedNonce: nonce.hashedNonce,

      usedAt: nonce.usedAt ?? undefined,

      usedData: (nonce.usedData ?? undefined) as JsonObject | undefined,

      expiresAt: nonce.expiresAt,
      createdAt: nonce.createdAt,
      attempts: nonce.attempts,
    };
  }

  public async find(
    where: { id: string; type: string; authId?: string; used?: boolean; expired?: boolean },
    tx?: Prisma.TransactionClient,
  ): Promise<IAuthnNonce | null> {
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnNonce.findUnique({
      where,
    });
    return entity ? this.toIAuthnNonce(entity) : null;
  }

  public async findRecent(
    authId: string,
    type: string,
    since: Date,
    tx?: Prisma.TransactionClient,
  ): Promise<IAuthnNonce | null> {
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnNonce.findFirst({
      where: {
        authId,
        type,
        createdAt: {
          gte: since,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return entity ? this.toIAuthnNonce(entity) : null;
  }

  public async create(data: IAuthnNonceCreate, tx?: Prisma.TransactionClient): Promise<IAuthnNonce> {
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnNonce.create({ data });
    return this.toIAuthnNonce(entity);
  }

  public async update(
    where: { id: string },
    data: IAuthnNonceUpdate,
    tx?: Prisma.TransactionClient,
  ): Promise<IAuthnNonce> {
    if (!('id' in where)) {
      throw new Error('Invalid where parameter');
    }
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnNonce.update({
      where,
      data,
    });
    return this.toIAuthnNonce(entity);
  }

  public async decrementAttempts(id: string, tx?: Prisma.TransactionClient): Promise<IAuthnNonce> {
    const client = tx ?? this.prismaService.client;
    const entity = await client.authnNonce.update({
      where: { id },
      data: {
        attempts: {
          decrement: 1,
        },
      },
    });
    return this.toIAuthnNonce(entity);
  }

  public async delete(
    where: {
      id?: string | string[];
      authId?: string | string[];
      type?: string | string[];
      used?: boolean;
      expired?: boolean;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService.client;
    const deleteWhere: Prisma.AuthnNonceWhereInput = {};
    for (const [key, value] of Object.entries(where)) {
      switch (key) {
        case 'id':
        case 'type':
        case 'authId':
          if (typeof value === 'string') {
            deleteWhere[key] = value;
          } else if (Array.isArray(value)) {
            deleteWhere[key] = { in: value };
          } else {
            throw new Error(`Invalid where parameter for ${key}: ${value}`);
          }
          break;
        case 'used':
          if (typeof value === 'boolean') {
            deleteWhere.usedAt = value ? { not: null } : null;
          } else {
            throw new Error(`Invalid where parameter for ${key}: ${JSON.stringify(value)}`);
          }
          break;
        case 'expired':
          if (typeof value === 'boolean') {
            deleteWhere.expiresAt = value ? { lt: new Date() } : { gte: new Date() };
          } else {
            throw new Error(`Invalid where parameter for ${key}: ${JSON.stringify(value)}`);
          }
          break;
        default:
          throw new Error('Invalid where parameter');
      }
    }

    if (Object.keys(deleteWhere).length === 0) {
      throw new Error('No where parameter provided');
    }

    await client.authnNonce.deleteMany({ where: deleteWhere });
    return;
  }

  withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.prismaService.client.$transaction((prisma) => {
      return fn(prisma);
    });
  }
}
