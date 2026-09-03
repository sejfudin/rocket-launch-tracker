import { makeUUID } from '~common/utils/short-uuid';

import { type Media, type PrismaClient } from '~database/prisma/client';
import { PrismaFixture } from '~database/prisma/fixtures';

export class MediaFixture extends PrismaFixture<Media> {
  entity!: Media;

  public static async fromPartial(prismaClient: PrismaClient, data?: Partial<Media>, relations?: {}) {
    const unknownKeys = Object.keys(relations ?? {});
    if (unknownKeys.length > 0) {
      throw new Error(`Unknown relation key: ${unknownKeys.join(', ')}`);
    }

    const fixture = new MediaFixture();
    const id = data?.id ?? makeUUID();

    fixture.entity = await prismaClient.media.create({
      data: {
        id,
        key: data?.key ?? makeUUID(),
        resourceName: data?.resourceName ?? `mock-${makeUUID()}`,
        fileName: data?.fileName ?? 'mock.png',
        mimeType: data?.mimeType ?? 'image/png',
        fileSize: data?.fileSize ?? 100,
        provider: data?.provider ?? 'prisma',
        uploaded: data?.uploaded ? new Date() : undefined,
        validated: data?.validated ? new Date() : undefined,
        deleted: data?.deleted ? new Date() : undefined,
      },
    });

    return fixture;
  }
}
