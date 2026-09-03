import { sign } from 'jsonwebtoken';

import {
  type AuthnIdentityFixture,
  AuthnIdentityFixture as AuthnIdentityFixtureClass,
} from '~common/authn/persistors/prisma/tests/authn-identity.fixture';
import { getConfig } from '~common/config';
import { hash } from '~common/utils/hash/hash';
import { makeId, makeUUID } from '~common/utils/short-uuid';

import { type PrismaClient, type User } from '~database/prisma/client';
import { PrismaFixture } from '~database/prisma/fixtures';

import { USER_AUTHN_LOCAL_PROVIDER } from '~modules/users/auth/providers/local/user-auth-local.constants';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { USER_AUTHN_KEY, USER_AUTH_JWT_AUDIENCE } from '~modules/users/auth/user-auth.constants';
import { UserRole } from '~modules/users/user/user.constants';

const userAuthConfig = getConfig(UserAuthConfig);

export class UserFixture extends PrismaFixture<User> {
  entity!: User;

  public authnIdentity?: AuthnIdentityFixture;
  public email?: string;
  public password?: string;

  public static async fromPartial(
    prismaClient: PrismaClient,
    data?: Partial<User> & { lastLoginAt?: boolean | Date; password?: string; disabledAt?: Date },
    relations?: {},
  ) {
    const unknownKeys = Object.keys(relations ?? {}).filter((key) => !['country'].includes(key));
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown relation key: ${unknownKeys.join(', ')}`);
    }

    const fixture = new UserFixture();

    const { password, disabledAt, ...userData } = data ?? {};

    const id = userData?.id ?? makeUUID();

    fixture.email = (userData?.email ?? `user+${makeId()}@example.com`).toLowerCase().trim();
    fixture.password = password ?? 'testpassword123';

    fixture.entity = await prismaClient.user.create({
      data: {
        id,
        email: fixture.email,
        name: data?.name ?? 'John Doe',
        roles: data?.roles ?? [UserRole.client],
      },
    });

    fixture.authnIdentity = await AuthnIdentityFixtureClass.fromPartial(prismaClient, {
      providerId: fixture.email,
      userId: id,
      providerData: {
        password: hash(fixture.password),
      },
      provider: USER_AUTHN_LOCAL_PROVIDER,
      namespace: USER_AUTHN_KEY,
      disabledAt,
    });

    return fixture;
  }

  get authorizationHeader() {
    return `Bearer ${sign(
      {
        sub: this.authnIdentity?.entity.id ?? makeUUID(),
        uid: this.entity.id,
        aud: USER_AUTH_JWT_AUDIENCE,
      },
      userAuthConfig.secret,
      {
        expiresIn: '1h',
      },
    )}`;
  }
}
