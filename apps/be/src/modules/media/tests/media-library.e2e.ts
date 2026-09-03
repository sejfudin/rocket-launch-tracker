import { HttpStatus, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { AuthzModule } from '~common/authz/authz.module';
import { LoggerModule } from '~common/logger';
import { MediaModule } from '~common/media';
import { MediaConfig } from '~common/media/media.config';
import { MEDIA_REST_PREFIX } from '~common/media/media.constants';
import { PrismaMediaPersistorPlugin } from '~common/media/persistors/prisma';
import { PrismaMediaProviderPlugin } from '~common/media/providers/prisma';
import { PrismaMediaProvider } from '~common/media/providers/prisma/prisma-media.provider';
import { PRISMA_MEDIA_PROVIDER_NAME } from '~common/media/providers/prisma/prisma-media.provider.types';
import { MediaFixture } from '~common/media/tests/media.fixture';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { type PrismaClient } from '~database/prisma/generated/client';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { MediaLibraryModule } from '~modules/media';
import { UserAuthJwtModule } from '~modules/users/auth/providers/jwt/user-auth-jwt.module';
import { UserModule } from '~modules/users/user';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';
import { UserFixture } from '~modules/users/user/tests/user.fixture';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

const pngImage = {
  data: new Uint8Array(
    atob(
      'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAIklEQVQI12N4raiHFTEA8f8PWmgIIYFTB2GjiNaBXQIrAgC1H1qz4fywJQAAAABJRU5ErkJggg==',
    )
      .split('')
      .map((c) => c.charCodeAt(0)),
  ),
  mimeType: 'image/png',
  fileName: 'image.png',
};

describe('Media Library', () => {
  let app: INestApplication;

  let prismaMediaProvider: PrismaMediaProvider;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [
          LoggerModule,
          PrismaEphemeralModule.forRoot([UserPrismaRepositoryPlugin]),

          AuthzModule.forRoot([]),
          AuthnModule.forRoot([PrismaAuthnPersistorPlugin]),
          UserModule,
          UserAuthJwtModule,

          MediaModule.forRoot([PrismaMediaProviderPlugin, PrismaMediaPersistorPlugin]),
          MediaLibraryModule,
        ],
      },
      {
        overrideProviders: [[MediaConfig, { defaultProvider: PRISMA_MEDIA_PROVIDER_NAME }]],
      },
    );

    prismaClient = app.get(PrismaService).client;
    prismaMediaProvider = app.get(PrismaMediaProvider);
  });

  it('should upload using post then download the same file', async ({ expect }) => {
    const key = `media/${makeId()}`;

    const media = await MediaFixture.fromPartial(prismaClient, {
      key,
      resourceName: `media/${makeId()}`,
      fileName: pngImage.fileName,
      mimeType: pngImage.mimeType,
      fileSize: pngImage.data.length,
      provider: PRISMA_MEDIA_PROVIDER_NAME,
    });

    const uploadInstructions = await prismaMediaProvider.createUploadRequest(
      {
        mimeType: media.entity.mimeType,
        fileName: media.entity.fileName,
        fileSize: media.entity.fileSize,
      },
      {
        key: media.entity.key,
        method: 'post',
      },
    );
    expect(uploadInstructions).toEqual(expect.objectContaining({ method: 'post', url: expect.any(String) }));

    let uploadRequest = request(app.getHttpServer()).post(uploadInstructions.url!.replace(/^.*?\/media/, '/media'));

    for (const [k, v] of uploadInstructions.fields || []) {
      uploadRequest = uploadRequest.field(k, v);
    }

    uploadRequest = uploadRequest.attach('file', Buffer.alloc(pngImage.data.length, pngImage.data), {
      contentType: pngImage.mimeType,
      filename: pngImage.fileName,
    });

    await uploadRequest.expect(HttpStatus.NO_CONTENT);

    // check database entry
    const dbMedia = await prismaClient.media.findUnique({ where: { key } });
    expect(dbMedia).toEqual(
      expect.objectContaining({ uploaded: expect.any(Date), validated: expect.any(Date), loOid: expect.any(Number) }),
    );

    // download the image, expect it to be the same
    const fetchInstructions = await prismaMediaProvider.createFetchRequest(
      { key },
      { providerOptions: { signFetch: true } },
    );

    expect(fetchInstructions).toEqual(expect.objectContaining({ url: expect.stringContaining(key) }));

    await request(app.getHttpServer())
      .get(fetchInstructions.url!.replace(/^.+?\/media/, '/media'))
      .send()
      .expect(HttpStatus.OK)
      .expect('Content-Type', pngImage.mimeType)
      .expect('Content-Length', pngImage.data.length.toString())
      .expect('Content-Disposition', `attachment`);
  });

  it('should upload using media-library endpoints', async () => {
    const user = await UserFixture.fromPartial(prismaClient, { roles: ['client'] });

    await request(app.getHttpServer())
      .post(`/${MEDIA_REST_PREFIX}/presigned-url`)
      .set('Authorization', user.authorizationHeader)
      .send({
        resourceName: 'small-image',
        fileName: pngImage.fileName,
        fileSize: pngImage.data.length,
        method: 'post',
      })
      .expect(HttpStatus.CREATED);
  });
});
