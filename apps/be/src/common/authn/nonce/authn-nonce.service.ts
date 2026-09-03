import { HttpStatus, Injectable } from '@nestjs/common';

import { AuthnException } from '~common/authn';
import { AuthnIdentityPersistor } from '~common/authn/identity';
import { BadRequestException } from '~common/exceptions';
import type { JsonObject } from '~common/types';
import { hash, validateHash } from '~common/utils/hash/hash';
import { idToUUID, makeId, makeUUID, uuidToId } from '~common/utils/short-uuid';

import { Transaction } from '~database/types';

import { IAuthnIdentity, type IAuthnNonce, type IAuthnNonceCreate } from '../authn.types';
import { AuthnNoncePersistor } from './authn-nonce-persistor.abstract';

@Injectable()
export class AuthnNonceService {
  constructor(
    private readonly authnNoncePersistor: AuthnNoncePersistor,
    private readonly authnIdentityPersistor: AuthnIdentityPersistor,
  ) {}

  public async find(
    where: { id: string; type: string; authId?: string; used?: boolean; expired?: boolean },
    tx?: Transaction,
  ): Promise<IAuthnNonce | null> {
    return this.authnNoncePersistor.find(where, tx);
  }

  public async generate(
    where: { providerId: string; namespace: string; provider: string } | { id: string },
    data: { type: string; expiresIn: number; throttleSeconds?: number; maxAttempts?: number; nonce?: string },
  ): Promise<{ code: string; nonce: string; id: string; expiresAt: Date; authnIdentity: IAuthnIdentity }> {
    const { type, expiresIn, throttleSeconds = 15, maxAttempts = 3 } = data;

    const nonce = data.nonce ?? makeId();
    const hashedNonce = hash(nonce);

    return this.authnNoncePersistor.withTransaction(async (tx) => {
      // make sure the user is active
      const authnIdentity = await this.authnIdentityPersistor.find(where, tx);
      if (!authnIdentity) {
        throw new AuthnException('Identity not found', {
          code: 'identity-not-found',
          httpStatus: HttpStatus.BAD_REQUEST,
        });
      }

      // throttle: check for recent nonce creation
      const throttleSince = new Date(Date.now() - throttleSeconds * 1000);
      const recentNonce = await this.authnNoncePersistor.findRecent(authnIdentity.id, type, throttleSince, tx);
      if (recentNonce) {
        throw new AuthnException('Nonce creation throttled', {
          code: 'nonce-throttled',
          httpStatus: HttpStatus.TOO_MANY_REQUESTS,
        });
      }

      // only 1 valid nonce per authId/type can exist at the same time
      await this.authnNoncePersistor.delete({ authId: authnIdentity.id, type, used: false, expired: false }, tx);

      const { id, expiresAt } = await this.create(
        {
          id: makeUUID(),
          authId: authnIdentity.id,
          type,
          hashedNonce,
          expiresAt: new Date(Date.now() + (expiresIn || 10 * 60) * 1000),
          attempts: maxAttempts,
        },
        tx,
      );

      return { authnIdentity, code: `${uuidToId(id)}:${nonce}`, nonce, id, expiresAt, type };
    });
  }

  public async consume(
    data: { code: string; type: string } | { nonce: string; id: string; type: string },
    usedData: JsonObject,
  ): Promise<{ authnIdentity: IAuthnIdentity; nonce: IAuthnNonce }> {
    let id: string;
    let nonce: string;
    if ('code' in data) {
      if (!data.code || !data.code.includes(':')) {
        throw new BadRequestException('Invalid code', { code: 'code-invalid' });
      }
      try {
        id = idToUUID(data.code.split(':')[0]);
      } catch (error) {
        throw new BadRequestException('Invalid code', { code: 'code-invalid', cause: error });
      }
      nonce = data.code.split(':')[1];
    } else {
      id = data.id;
      nonce = data.nonce;
    }

    // Read nonce outside transaction to check state
    const storedNonce = await this.authnNoncePersistor.find({ id, type: data.type });

    if (!storedNonce) {
      throw new AuthnException('Code was not found', { code: 'code-not-found' });
    }

    if (storedNonce.expiresAt < new Date() || storedNonce.usedAt) {
      throw new AuthnException('Code is expired', { code: 'code-expired', httpStatus: HttpStatus.BAD_REQUEST });
    }

    // check attempts limit (attempts count down from maxAttempts to 0)
    if (storedNonce.attempts <= 0) {
      throw new AuthnException('Maximum consumption attempts exceeded', {
        code: 'code-max-attempts',
        httpStatus: HttpStatus.TOO_MANY_REQUESTS,
      });
    }

    // Validate hash and decrement attempts atomically if invalid
    if (!validateHash(nonce, storedNonce.hashedNonce)) {
      await this.authnNoncePersistor.decrementAttempts(storedNonce.id);
      throw new AuthnException('Code is invalid', { code: 'code-invalid' });
    }

    // Valid hash - consume in transaction
    const consumedNonce = await this.authnNoncePersistor.withTransaction(async (tx) => {
      // Re-check in transaction to prevent race conditions
      const txNonce = await this.authnNoncePersistor.find({ id, type: data.type }, tx);
      if (!txNonce || txNonce.usedAt || txNonce.expiresAt < new Date()) {
        throw new AuthnException('Code is expired', { code: 'code-expired', httpStatus: HttpStatus.BAD_REQUEST });
      }

      return await this.authnNoncePersistor.update({ id: storedNonce.id }, { usedAt: new Date(), usedData }, tx);
    });

    const authnIdentity = await this.authnIdentityPersistor.find({ id: consumedNonce.authId });

    if (!authnIdentity) {
      throw new AuthnException('Identity not found', { code: 'identity-not-found' });
    }

    return { authnIdentity, nonce: consumedNonce };
  }

  public async create(data: IAuthnNonceCreate, tx?: Transaction): Promise<IAuthnNonce> {
    return this.authnNoncePersistor.create(data, tx);
  }

  public async delete(
    where: {
      id?: string | string[];
      authId?: string | string[];
      type?: string | string[];
      used?: boolean;
      expired?: boolean;
    },
    tx?: Transaction,
  ): Promise<void> {
    return this.authnNoncePersistor.delete(where, tx);
  }

  public async withTransaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.authnNoncePersistor.withTransaction(fn);
  }
}
