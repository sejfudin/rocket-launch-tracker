import { Readable } from 'node:stream';
import type { Mock } from 'node:test';

import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, it } from 'vitest';

import { LoggerModule } from '~common/logger';
import { makeUUID } from '~common/utils/short-uuid';

import { MediaLoader } from '../media.loader';
import { MediaModule } from '../media.module';
import { MediaService } from '../media.service';
import { type MediaProvider } from '../media-provider.abstract';
import { MediaLabelsField } from '../models/media-labels.request';
import { NotImplementedMediaPersistorPlugin } from '../persistors/not-implemented';
import { MediaPersistorMock, MediaProviderMock, exampleMedia } from './media.mock';

describe('MediaService', () => {
  let app: INestApplication;
  let mediaService: MediaService;
  let mediaProviderGetMeta: Mock<NonNullable<MediaProvider['getMeta']>>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, MediaModule.forRoot([NotImplementedMediaPersistorPlugin])],
    })
      .overrideProvider(MediaPersistorMock.provide)
      .useValue(MediaPersistorMock.useValue)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    mediaService = app.get(MediaService);
    app.get(MediaLoader).providers = {
      [MediaProviderMock.provider]: MediaProviderMock.useValue,
    };
    mediaProviderGetMeta = MediaProviderMock.useValue.getMeta as Mock<NonNullable<MediaProvider['getMeta']>>;
  });

  it('should raw upload/fetch requests and return instructions', async ({ expect }) => {
    expect(
      await mediaService.createProviderUploadRequest(
        {
          fileName: 'test.png',
          fileSize: 1000,
        },
        { method: 'put', provider: MediaProviderMock.provider },
      ),
    ).toEqual(expect.objectContaining({ method: 'put' }));

    expect(
      await mediaService.createProviderFetchRequest(
        {
          key: '1',
        },
        {
          provider: 'mock-provider',
        },
      ),
    ).toEqual(expect.objectContaining({ url: expect.any(String) }));
  });

  it('should perform CRUD operations on persistor', async ({ expect }) => {
    expect(await mediaService.list({ where: { id: 'mock-id' } })).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'mock-id' })]),
    );
    expect(await mediaService.find({ id: 'mock-id' })).toEqual(expect.objectContaining({ id: 'mock-id' }));
  });

  it('should create and validate media upload requests', async ({ expect }) => {
    expect(
      await mediaService.createMediaUploadRequest(
        {
          fileName: 'my-image.jpeg',
          fileSize: 500,
          resourceName: 'small-image',
          userId: makeUUID(),
        },
        {
          key: '1',
          method: 'put',
          constraints: {
            fileSize: 500,
            mimeTypes: ['image/jpeg'],
          },
          provider: MediaProviderMock.provider,
        },
      ),
    ).toEqual(expect.objectContaining({ method: 'put' }));
  });

  it('should create media fetch requests', async ({ expect }) => {
    expect(
      await mediaService.createMediaFetchRequest({
        id: '1',
      }),
    ).toEqual(expect.objectContaining({ url: expect.any(String) }));
  });

  it('should create media fetch requests in bulk', async ({ expect }) => {
    expect(
      await mediaService.applyMediaFetchRequests([{ media: { id: '1' } }, { mediaId: { id: '2' } }], 'media'),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ media: expect.objectContaining({ url: expect.any(String), id: '1' }) }),
      ]),
    );
  });

  it('should validate a uploaded media', async ({ expect }) => {
    mediaProviderGetMeta.mock.mockImplementationOnce(async () => ({ fileSize: 500, mimeType: 'image/jpeg' }));
    expect(
      await mediaService.validate(
        {
          id: '1',
        },
        'small-image',
        {
          id: '1',
          key: 'small-image/random-key',
          mimeType: 'image/jpeg',
          fileName: 'my-image.jpeg',
          fileSize: 500,
          resourceName: 'small-image',
          provider: 'mock-provider',
          userId: makeUUID(),
          createdAt: new Date(),
        },
      ),
    ).toEqual(
      expect.objectContaining({
        validated: expect.any(Date),
        uploaded: expect.any(Date),
      }),
    );
  });

  it('should associate a media', async ({ expect }) => {
    mediaProviderGetMeta.mock.mockImplementationOnce(async () => ({ fileSize: 500, mimeType: 'image/jpeg' }));
    expect(
      await mediaService.associate(
        {
          id: '1',
          key: 'small-image/random-key',
          mimeType: 'image/jpeg',
          fileName: 'my-image.jpeg',
          fileSize: 500,
          resourceName: 'small-image',
          provider: 'mock-provider',
          createdAt: new Date(),
        },
        {
          module: 'test',
          type: 'test',
          resourceId: '0000-0000-0000-0000',
          userId: makeUUID(),
        },
      ),
    ).toEqual(
      expect.objectContaining({
        module: 'test',
        type: 'test',
      }),
    );
  });

  describe('count', () => {
    it('should return total count when no groupBy is specified', async ({ expect }) => {
      const result = await mediaService.count();

      expect(result).toEqual({ total: 8 });
    });

    it('should return total count with where filters', async ({ expect }) => {
      const result = await mediaService.count({ type: 'image', module: 'user-profile' });

      expect(result).toEqual({ total: 8 });
    });

    it('should return grouped count by module with filters', async ({ expect }) => {
      const result = await mediaService.count({ provider: 'mock-provider' }, { groupBy: 'module' });

      expect(result).toEqual({ 'user-profile': 4, blog: 4 });
    });

    it('should handle array filters correctly', async ({ expect }) => {
      const result = await mediaService.count(
        {
          type: ['image', 'document'],
          module: ['user-profile', 'blog'],
          provider: ['mock-provider', 'other-provider'],
        },
        { groupBy: 'type' },
      );

      expect(result).toEqual({ image: 5, document: 3 });
    });
  });

  describe('listLabels', () => {
    it('should list labels for modules', async ({ expect }) => {
      const result = await mediaService.listLabels({ field: MediaLabelsField.MODULE });

      expect(result).toEqual(
        expect.arrayContaining([
          { id: 'user-profile', label: 'user-profile' },
          { id: 'blog', label: 'blog' },
          { id: 'product', label: 'product' },
        ]),
      );
    });

    it('should list labels for types', async ({ expect }) => {
      const result = await mediaService.listLabels({ field: MediaLabelsField.TYPE });

      expect(result).toEqual(
        expect.arrayContaining([
          { id: 'avatar', label: 'avatar' },
          { id: 'thumbnail', label: 'thumbnail' },
          { id: 'banner', label: 'banner' },
        ]),
      );
    });

    it('should list labels for mimeTypes', async ({ expect }) => {
      const result = await mediaService.listLabels({ field: MediaLabelsField.MIME_TYPE });

      expect(result).toEqual(
        expect.arrayContaining([
          { id: 'image/jpeg', label: 'image/jpeg' },
          { id: 'image/png', label: 'image/png' },
          { id: 'application/pdf', label: 'application/pdf' },
        ]),
      );
    });

    it('should support search parameter', async ({ expect }) => {
      const result = await mediaService.listLabels({ field: MediaLabelsField.MODULE, search: 'user' });

      expect(result).toEqual(expect.arrayContaining([{ id: 'user-profile', label: 'user-profile' }]));
    });

    it('should support limit parameter', async ({ expect }) => {
      const result = await mediaService.listLabels({ field: MediaLabelsField.MODULE, limit: 2 });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('paginate', () => {
    it('should return paginated media', async ({ expect }) => {
      const result = await mediaService.paginate({ limit: 10 });

      expect(result).toEqual(
        expect.objectContaining({
          items: expect.arrayContaining([expect.objectContaining({ id: 'mock-id' })]),
          totalItems: expect.any(Number),
          limit: expect.any(Number),
        }),
      );
    });

    it('should support filter by ids', async ({ expect }) => {
      const result = await mediaService.paginate({ limit: 10, filter: { ids: ['1', '2'] } });

      expect(result.items.length).toBe(2);
      expect(result.items.map((item) => item.id)).toEqual(['1', '2']);
    });
  });

  describe('markForDeletion', () => {
    it('should mark media for deletion', async ({ expect }) => {
      const result = await mediaService.markForDeletion({ id: 'mock-id' });

      expect(result).toBeNull();
    });
  });

  describe('deleteMedia', () => {
    it('should delete media from provider and persistor', async ({ expect }) => {
      const mediaProviderDelete = MediaProviderMock.useValue.delete as Mock<NonNullable<MediaProvider['delete']>>;
      mediaProviderDelete.mock.mockImplementationOnce(async () => undefined);

      await mediaService.deleteMedia(exampleMedia);

      expect(mediaProviderDelete.mock.calls.length).toBe(1);
      expect(mediaProviderDelete.mock.calls[0]?.arguments[0]).toBe(exampleMedia.key);
    });

    it('should handle provider without delete method', async ({ expect }) => {
      const providerWithoutDelete = {
        ...MediaProviderMock.useValue,
        delete: undefined,
      };
      app.get(MediaLoader).providers = {
        [MediaProviderMock.provider]: providerWithoutDelete,
      };

      await expect(mediaService.deleteMedia(exampleMedia)).resolves.not.toThrow();

      app.get(MediaLoader).providers = {
        [MediaProviderMock.provider]: MediaProviderMock.useValue,
      };
    });
  });

  describe('uploadMedia', () => {
    it('should upload media and register it in persistor', async ({ expect }) => {
      const stream = Readable.from(Buffer.from('test content'));
      const mediaProviderUpload = MediaProviderMock.useValue.upload as Mock<NonNullable<MediaProvider['upload']>>;
      mediaProviderUpload.mock.mockImplementationOnce(async () => ({ key: 'test-key' }));

      const result = await mediaService.uploadMedia(
        stream,
        {
          fileName: 'test.png',
          fileSize: 1000,
          resourceName: 'test-resource',
          userId: makeUUID(),
        },
        {
          provider: MediaProviderMock.provider,
          constraints: {
            fileSize: 2000,
            mimeTypes: ['image/png'],
          },
        },
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          key: expect.any(String),
          uploaded: expect.any(Date),
          validated: expect.any(Date),
        }),
      );
      expect(mediaProviderUpload.mock.calls.length).toBeGreaterThan(0);
    });

    it('should validate constraints before upload', async ({ expect }) => {
      const stream = Readable.from(Buffer.from('test content'));

      await expect(
        mediaService.uploadMedia(
          stream,
          {
            fileName: 'test.png',
            fileSize: 3000,
            resourceName: 'test-resource',
            userId: makeUUID(),
          },
          {
            provider: MediaProviderMock.provider,
            constraints: {
              fileSize: 2000,
              mimeTypes: ['image/png'],
            },
          },
        ),
      ).rejects.toThrow();
    });
  });

  describe('downloadMedia', () => {
    it('should download media by id', async ({ expect }) => {
      const mediaProviderDownload = MediaProviderMock.useValue.download as Mock<NonNullable<MediaProvider['download']>>;
      mediaProviderDownload.mock.mockImplementationOnce(async () => ({
        stream: Readable.from(Buffer.from('test content')),
        fileSize: 1000,
        mimeType: 'image/png',
      }));

      const result = await mediaService.downloadMedia('mock-id');

      expect(result).toEqual(
        expect.objectContaining({
          stream: expect.any(Readable),
          media: expect.objectContaining({ id: 'mock-id' }),
        }),
      );
    });

    it('should download media by media object', async ({ expect }) => {
      const mediaProviderDownload = MediaProviderMock.useValue.download as Mock<NonNullable<MediaProvider['download']>>;
      mediaProviderDownload.mock.mockImplementationOnce(async () => ({
        stream: Readable.from(Buffer.from('test content')),
        fileSize: 1000,
        mimeType: 'image/png',
      }));

      const result = await mediaService.downloadMedia(exampleMedia);

      expect(result).toEqual(
        expect.objectContaining({
          stream: expect.any(Readable),
          media: exampleMedia,
        }),
      );
    });

    it('should throw error when media not found', async ({ expect }) => {
      const mediaPersistorFind = MediaPersistorMock.useValue.find as Mock<typeof MediaPersistorMock.useValue.find>;
      mediaPersistorFind.mock.mockImplementationOnce(async () => null);

      await expect(mediaService.downloadMedia('non-existent-id')).rejects.toThrow('Media not found');
    });
  });

  describe('providerUpload', () => {
    it('should upload file directly to provider', async ({ expect }) => {
      const stream = Readable.from(Buffer.from('test content'));
      const mediaProviderUpload = MediaProviderMock.useValue.upload as Mock<NonNullable<MediaProvider['upload']>>;
      const initialCallCount = mediaProviderUpload.mock.calls.length;
      mediaProviderUpload.mock.mockImplementationOnce(async () => ({ key: 'test-key' }));

      await mediaService.providerUpload(
        {
          stream,
          fileName: 'test.png',
          fileSize: 1000,
          mimeType: 'image/png',
        },
        {
          provider: MediaProviderMock.provider,
          constraints: {
            fileSize: 2000,
            mimeTypes: ['image/png'],
          },
        },
      );

      expect(mediaProviderUpload.mock.calls.length).toBe(initialCallCount + 1);
    });

    it('should validate constraints before upload', async ({ expect }) => {
      const stream = Readable.from(Buffer.from('test content'));

      await expect(
        mediaService.providerUpload(
          {
            stream,
            fileName: 'test.png',
            fileSize: 3000,
            mimeType: 'image/png',
          },
          {
            provider: MediaProviderMock.provider,
            constraints: {
              fileSize: 2000,
              mimeTypes: ['image/png'],
            },
          },
        ),
      ).rejects.toThrow();
    });
  });

  describe('providerDownload', () => {
    it('should download file directly from provider', async ({ expect }) => {
      const mediaProviderDownload = MediaProviderMock.useValue.download as Mock<NonNullable<MediaProvider['download']>>;
      const initialCallCount = mediaProviderDownload.mock.calls.length;
      mediaProviderDownload.mock.mockImplementationOnce(async () => ({
        stream: Readable.from(Buffer.from('test content')),
        fileSize: 1000,
        mimeType: 'image/png',
      }));

      const result = await mediaService.providerDownload(
        {
          key: 'test-key',
        },
        {
          provider: MediaProviderMock.provider,
        },
      );

      expect(result).toEqual(
        expect.objectContaining({
          stream: expect.any(Readable),
          fileSize: 1000,
          mimeType: 'image/png',
        }),
      );
      expect(mediaProviderDownload.mock.calls.length).toBe(initialCallCount + 1);
      const lastCall = mediaProviderDownload.mock.calls[mediaProviderDownload.mock.calls.length - 1];
      expect(lastCall?.arguments[0]).toBe('test-key');
    });
  });
});
