import { makeId, makeUUID } from '~common/utils/short-uuid';

import { type AuthnIdentity, type PrismaClient } from '~database/prisma/client';
import { PrismaFixture } from '~database/prisma/fixtures';

export class AuthnIdentityFixture extends PrismaFixture<AuthnIdentity> {
  entity!: AuthnIdentity;

  public static async fromPartial(prismaClient: PrismaClient, data?: Partial<AuthnIdentity>, relations?: {}) {
    const unknownKeys = Object.keys(relations ?? {});
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown relation key: ${unknownKeys.join(', ')}`);
    }

    const fixture = new AuthnIdentityFixture();
    const id = data?.id ?? makeUUID();

    fixture.entity = await prismaClient.authnIdentity.create({
      data: {
        id,
        provider: data?.provider ?? 'hotwire',
        providerId: data?.providerId ?? makeId(),
        namespace: data?.namespace ?? 'user',
        providerData: data?.providerData ?? {},
        userId: data?.userId ?? makeUUID(),
        disabledAt: data?.disabledAt,
        validatedAt: data?.validatedAt,
      },
    });

    return fixture;
  }
}
