import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { beforeAll, describe } from 'vitest';

import { LoggerModule } from '~common/logger';
import { MediaModule } from '~common/media';
import { PrismaMediaPersistorPlugin } from '~common/media/persistors/prisma';
import { PrismaMediaProviderPlugin } from '~common/media/providers/prisma';
import { PrismaMediaProvider } from '~common/media/providers/prisma/prisma-media.provider';
import { createMediaProviderTestSuite, pngImage } from '~common/media/tests/media-provider.test-suite';

import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

describe('PrismaMediaProvider', () => {
  let app: INestApplication;
  let mediaProvider: PrismaMediaProvider;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule,
        PrismaEphemeralModule.forRoot([]),
        MediaModule.forRoot([PrismaMediaProviderPlugin, PrismaMediaPersistorPlugin]),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    mediaProvider = app.get(PrismaMediaProvider);
  });

  createMediaProviderTestSuite({
    provider: () => mediaProvider,
    fetchOptions: {
      providerOptions: { signFetch: true },
    },
    supportedMethods: ['post'],
    downloadHelper: async (fetchInstructions, expect) => {
      const fetchResponse = await request(app.getHttpServer())
        .get(fetchInstructions.url!.replace(/^.*?\/media/, '/media'))
        .send();

      expect(fetchResponse.status).toBe(200);
      return {
        data: new Uint8Array(fetchResponse.body),
        fileSize: fetchResponse.body.length,
        mimeType: fetchResponse.headers['content-type'] || '',
      };
    },
    uploadHelper: async (uploadInstructions, data) => {
      switch (uploadInstructions.method) {
        case 'post': {
          const bufferData =
            data instanceof Blob
              ? Buffer.from(await data.arrayBuffer())
              : Buffer.isBuffer(data)
                ? data
                : Buffer.from(data);

          let uploadRequest = request(app.getHttpServer())
            .post(uploadInstructions.url!.replace(/^.*?\/media/, '/media'))
            .attach('file', bufferData, { filename: pngImage.fileName, contentType: pngImage.mimeType });

          if (uploadInstructions.fields) {
            for (const [k, v] of uploadInstructions.fields) {
              uploadRequest = uploadRequest.field(k, v);
            }
          }

          const uploadResponse = await uploadRequest;
          return {
            status: uploadResponse.status,
          };
        }
        default: {
          throw new Error(`Unsupported upload method: ${uploadInstructions.method}`);
        }
      }
    },
  });
});
