import { PushNotificationTemplateType } from '~common/push-notifications/models';
import { makeUUID } from '~common/utils/short-uuid';

import { type PrismaClient, type PushNotificationTemplate } from '~database/prisma/client';

export class PushNotificationTemplateFixture {
  entity!: PushNotificationTemplate;

  public static async fromPartial(prismaClient: PrismaClient, data?: Partial<PushNotificationTemplate>) {
    const fixture = new PushNotificationTemplateFixture();
    const now = new Date();

    fixture.entity = await prismaClient.pushNotificationTemplate.create({
      data: {
        ...data,
        id: data?.id ?? makeUUID(),
        name: data?.name ?? `template-${makeUUID()}`,
        title: data?.title ?? 'Test Template Title',
        body: data?.body ?? undefined,
        data: data?.data ?? undefined,
        imageUrl: data?.imageUrl ?? undefined,
        type: data?.type ?? PushNotificationTemplateType.CUSTOM,
        module: data?.module ?? undefined,
        description: data?.description ?? undefined,
        createdAt: data?.createdAt ?? now,
        updatedAt: data?.updatedAt ?? now,
      },
    });

    return fixture;
  }
}
