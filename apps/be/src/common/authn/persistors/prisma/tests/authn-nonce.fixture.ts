import { hash } from '~common/utils/hash/hash';
import { makeId, makeUUID, uuidToId } from '~common/utils/short-uuid';

import { type AuthnIdentity, type AuthnNonce, type PrismaClient } from '~database/prisma/client';
import { PrismaFixture } from '~database/prisma/fixtures';
import { resolveFixture } from '~database/prisma/fixtures/fixture.helpers';

import { AuthnIdentityFixture } from './authn-identity.fixture';

export class AuthnNonceFixture extends PrismaFixture<AuthnNonce> {
  entity!: AuthnNonce;

  public nonce?: string;
  public authnIdentity?: AuthnIdentityFixture;

  public static async fromPartial(
    prismaClient: PrismaClient,
    data?: Partial<AuthnNonce> & { nonceValue?: string },
    relations?: {
      authnIdentity?: AuthnIdentityFixture | Partial<AuthnIdentity>;
    },
  ) {
    const fixture = new AuthnNonceFixture();
    const now = new Date();

    if (!data?.authId && relations?.authnIdentity) {
      fixture.authnIdentity = await resolveFixture(prismaClient, AuthnIdentityFixture, relations.authnIdentity);
    }

    const id = data?.id ?? makeUUID();

    let hashedNonce: string;
    if (!data?.hashedNonce) {
      fixture.nonce = data?.nonceValue ?? makeId();
      hashedNonce = hash(fixture.nonce);
    } else {
      hashedNonce = data.hashedNonce;
    }

    fixture.entity = await prismaClient.authnNonce.create({
      data: {
        id,
        authId: data?.authId ?? fixture.authnIdentity?.entity.id ?? makeUUID(),
        type: data?.type ?? 'test',
        hashedNonce,
        expiresAt: data?.expiresAt ?? new Date(now.getTime() + 10 * 60 * 1000),
        usedAt: data?.usedAt ?? null,
        usedData: data?.usedData ?? undefined,
        attempts: data?.attempts ?? 3,
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now,
      },
    });

    return fixture;
  }

  get code() {
    if (!this.nonce) {
      throw new Error('Nonce value is not set');
    }
    return `${uuidToId(this.entity.id)}:${this.nonce}`;
  }
}
