import { makeUUID } from '~common/utils/short-uuid';

import { type PrismaClient, type PushNotificationToken } from '~database/prisma/client';

export class PushNotificationTokenFixture {
  entity!: PushNotificationToken;

  public static async fromPartial(prismaClient: PrismaClient, data?: Partial<PushNotificationToken>) {
    const fixture = new PushNotificationTokenFixture();
    const now = new Date();

    fixture.entity = await prismaClient.pushNotificationToken.create({
      data: {
        ...data,
        id: data?.id ?? makeUUID(),
        resourceName: data?.resourceName ?? `resource-${makeUUID()}`,
        token: data?.token ?? `token-${makeUUID()}`,
        provider: data?.provider ?? 'fcm',
        title: data?.title ?? undefined,
        module: data?.module ?? undefined,
        resourceId: data?.resourceId ?? undefined,
        expiresAt: data?.expiresAt ?? undefined,
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now,
      },
    });

    return fixture;
  }
}
