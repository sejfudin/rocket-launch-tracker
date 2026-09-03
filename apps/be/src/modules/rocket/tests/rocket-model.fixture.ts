import { makeUUID } from '~common/utils/short-uuid';

import type { PrismaClient, RocketModel } from '~database/prisma/client';
import { PrismaFixture } from '~database/prisma/fixtures';

export class RocketModelFixture extends PrismaFixture<RocketModel> {
  entity!: RocketModel;

  public static async fromPartial(prismaClient: PrismaClient, data?: Partial<RocketModel>) {
    const fixture = new RocketModelFixture();
    const now = new Date();

    const id = data?.id ?? makeUUID();

    fixture.entity = await prismaClient.rocketModel.create({
      data: {
        id,
        name: data?.name ?? `Model ${id}`,
        organization: data?.organization ?? 'ESA',
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now,
      },
    });

    return fixture;
  }
}
