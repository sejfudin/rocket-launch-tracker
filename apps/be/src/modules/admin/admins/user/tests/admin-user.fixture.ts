import { sign } from 'jsonwebtoken';

import { AuthnIdentityFixture } from '~common/authn/persistors/prisma/tests/authn-identity.fixture';
import { getConfig } from '~common/config';
import { hash } from '~common/utils/hash/hash';
import { makeId, makeUUID } from '~common/utils/short-uuid';

import { type AdminUser, type PrismaClient } from '~database/prisma/client';
import { PrismaFixture } from '~database/prisma/fixtures';

import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';
import {
  ADMIN_USER_AUTHN_KEY,
  ADMIN_USER_AUTH_JWT_AUDIENCE,
} from '~modules/admin/admins/auth/admin-user-auth.constants';
import { ADMIN_USER_AUTHN_LOCAL_PROVIDER } from '~modules/admin/admins/auth/providers/local/admin-user-auth-local.constants';

const adminUserAuthConfig = getConfig(AdminUserAuthConfig);

export class AdminUserFixture extends PrismaFixture<AdminUser> {
  entity!: AdminUser;

  public authnIdentity?: AuthnIdentityFixture;

  public email?: string;
  public password?: string;

  public static async fromPartial(
    prismaClient: PrismaClient,
    data?: Partial<AdminUser> & { lastLoginAt?: boolean | Date; password?: string; disabledAt?: Date },
    relations?: {},
  ) {
    const unknownKeys = Object.keys(relations ?? {}).filter((key) => !['country'].includes(key));
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown relation key: ${unknownKeys.join(', ')}`);
    }
    const fixture = new AdminUserFixture();
    const { password, disabledAt, ...adminUserData } = data ?? {};
    const id = adminUserData?.id ?? makeUUID();

    fixture.email = (adminUserData?.email ?? `admin+${makeId()}@example.com`).toLowerCase().trim();
    fixture.password = password ?? 'testpassword123';

    fixture.entity = await prismaClient.adminUser.create({
      data: {
        id,
        email: fixture.email,
        name: adminUserData?.name ?? 'John Doe',
        roles: adminUserData?.roles ?? [],
      },
    });

    fixture.authnIdentity = await AuthnIdentityFixture.fromPartial(prismaClient, {
      id,
      providerId: fixture.email,
      providerData: {
        password: hash(fixture.password),
      },
      userId: id,
      provider: ADMIN_USER_AUTHN_LOCAL_PROVIDER,
      namespace: ADMIN_USER_AUTHN_KEY,
      disabledAt,
    });

    return fixture;
  }

  get authorizationHeader() {
    return `Bearer ${sign(
      {
        sub: this.authnIdentity?.entity.id ?? makeUUID(),
        uid: this.entity.id,
        aud: ADMIN_USER_AUTH_JWT_AUDIENCE,
      },
      adminUserAuthConfig.secret,
      {
        expiresIn: '1h',
      },
    )}`;
  }
}
