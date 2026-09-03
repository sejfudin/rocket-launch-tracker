import { makeUUID } from '~common/utils/short-uuid';

import type { Activity, PrismaClient } from '~database/prisma/client';

export class ActivityFixture {
  entity!: Activity;

  public static async fromPartial(prismaClient: PrismaClient, data: Partial<Activity> = {}) {
    const fixture = new ActivityFixture();
    const now = new Date();

    fixture.entity = await prismaClient.activity.create({
      data: {
        id: data.id ?? makeUUID(),
        timestamp: data.timestamp ?? now,
        payload: data.payload ?? {},
        metadata: data.metadata ?? {},
        module: data.module ?? 'test-module',
        type: data.type ?? 'test-type',
        userId: data.userId ?? null,
        resourceId: data.resourceId ?? null,
      },
    });

    return fixture;
  }
}
