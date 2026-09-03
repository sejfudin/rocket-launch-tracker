import { makeId, makeUUID } from '~common/utils/short-uuid';

import type { PrismaClient, Rocket, RocketModel, User } from '~database/prisma/client';
import { PrismaFixture, resolveFixture } from '~database/prisma/fixtures';

import { RocketStatusType } from '~modules/rocket/models/rocket.types';
import { UserFixture } from '~modules/users/user/tests/user.fixture';

import { RocketModelFixture } from './rocket-model.fixture';

export class RocketFixture extends PrismaFixture<Rocket> {
  entity!: Rocket;

  public owner?: UserFixture;
  public model?: RocketModelFixture;

  public static async fromPartial(
    prismaClient: PrismaClient,
    data?: Partial<Rocket>,
    relations?: {
      owner?: UserFixture | Partial<User>;
      model?: RocketModelFixture | Partial<RocketModel>;
    },
  ) {
    const unknownKeys = Object.keys(relations ?? {}).filter((key) => !['owner', 'model'].includes(key));
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown relation key: ${unknownKeys.join(', ')}`);
    }

    const fixture = new RocketFixture();
    const now = new Date();

    if (!data?.ownerId && relations?.owner) {
      fixture.owner = await resolveFixture(prismaClient, UserFixture, relations.owner);
    }

    if (!data?.modelId) {
      fixture.model = await resolveFixture(
        prismaClient,
        RocketModelFixture,
        relations?.model || {
          name: `Model ${makeId()}`,
        },
      );
    }

    const id = data?.id ?? makeUUID();

    fixture.entity = await prismaClient.rocket.create({
      data: {
        id,
        name: data?.name ?? `Pretty Bird ${id}`,
        modelId: data?.modelId ?? fixture.model?.entity.id ?? makeUUID(),
        pictureId: data?.pictureId ?? null,
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now,
        status: data?.status ?? RocketStatusType.Ready,
        ownerId: fixture.owner?.entity.id ?? null,
      },
    });

    return fixture;
  }
}
