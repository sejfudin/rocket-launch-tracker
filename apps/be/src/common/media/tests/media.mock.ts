import { Readable } from 'node:stream';
import { mock } from 'node:test';

import { NotImplementedException } from '~common/exceptions';
import { type IPagination } from '~common/http/pagination';
import { ISettingsSection, SettingsPopulate, SettingsStatus } from '~common/settings';

import { MediaService } from '../media.service';
import { MediaPersistor } from '../media-persistor.abstract';
import { MediaProvider } from '../media-provider.abstract';
import type {
  IMedia,
  IMediaConstraints,
  IMediaFetchInstructions,
  IMediaFile,
  IMediaPaginationQuery,
  IMediaUploadInstructions,
} from '../models';
import { type ProviderMock } from '~test/utils';

const exampleMediaBlob = Buffer.from(
  new Uint8Array(
    atob(
      'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAIklEQVQI12N4raiHFTEA8f8PWmgIIYFTB2GjiNaBXQIrAgC1H1qz4fywJQAAAABJRU5ErkJggg==',
    )
      .split('')
      .map((c) => c.charCodeAt(0)),
  ),
);

export const exampleMedia: IMedia = {
  id: 'mock-id',
  key: 'mock-key',
  resourceName: 'mock-resource-name',
  fileName: 'mock-file-name.png',
  fileSize: exampleMediaBlob.length,
  mimeType: 'image/png',
  provider: 'mock-provider',
  createdAt: new Date(),
};

/**
 * Mock all calls to MediaService
 */
export const MediaServiceMock: ProviderMock<MediaService> = {
  provide: MediaService,
  useValue: {
    find: mock.fn(async () => {
      return exampleMedia;
    }),
    list: mock.fn(async () => {
      return [exampleMedia];
    }),
    createMediaUploadRequest: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    createMediaFetchRequest: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    createMediaFetchRequests: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    applyMediaFetchRequests: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    associate: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    createProviderUploadRequest: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    createProviderFetchRequest: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    validate: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    paginate: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    markForDeletion: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    deleteMedia: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    uploadMedia: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    providerUpload: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    count: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    listLabels: mock.fn(async (query: { field: 'module' | 'type' | 'mimeType'; search?: string; limit?: number }) => {
      if (query.field === 'module') {
        return [
          { id: 'user-profile', label: 'user-profile' },
          { id: 'blog', label: 'blog' },
          { id: 'product', label: 'product' },
        ];
      } else if (query.field === 'type') {
        return [
          { id: 'avatar', label: 'avatar' },
          { id: 'thumbnail', label: 'thumbnail' },
          { id: 'banner', label: 'banner' },
        ];
      } else {
        return [
          { id: 'image/jpeg', label: 'image/jpeg' },
          { id: 'image/png', label: 'image/png' },
          { id: 'application/pdf', label: 'application/pdf' },
          { id: 'text/plain', label: 'text/plain' },
        ];
      }
    }),
    downloadMedia: mock.fn(async () => {
      throw new NotImplementedException();
    }),
    providerDownload: mock.fn(async () => {
      throw new NotImplementedException();
    }),
  },
};

/**
 * Mock calls to Media Providers
 */
export const MediaProviderMock: ProviderMock<MediaProvider> & { provider: string } = {
  provider: exampleMedia.provider,
  provide: MediaProvider,
  useValue: {
    name: exampleMedia.provider,
    getMeta: mock.fn(async () => {
      return { fileSize: exampleMedia.fileSize, mimeType: exampleMedia.mimeType };
    }),
    createUploadRequest: mock.fn(
      async (
        file: IMediaFile,
        options: {
          key: string;
          method?: string;
          providerOptions?: Record<string, any>;
          constraints?: IMediaConstraints;
        },
      ) => {
        switch (options.method) {
          case 'post':
            return {
              method: options.method,
              url: 'http://localhost:8080/upload',
              fields: [['key', 'mock-key']],
              provider: 'mock-provider',
              id: 'mock-id',
            } satisfies IMediaUploadInstructions;
          case 'put':
          default:
            return {
              method: options.method || 'put',
              url: 'http://localhost:8080/upload',
              provider: 'mock-provider',
              id: 'mock-id',
            } satisfies IMediaUploadInstructions;
        }
      },
    ),
    createFetchRequest: mock.fn(async () => {
      return {
        url: 'http://localhost:8080/upload',
      } satisfies IMediaFetchInstructions;
    }),
    upload: mock.fn(async () => {
      return { key: 'mock-key' };
    }),
    download: mock.fn(async () => {
      return {
        stream: Readable.from(Buffer.from('test content')),
        fileSize: exampleMedia.fileSize,
        mimeType: exampleMedia.mimeType,
      };
    }),
    delete: mock.fn(async () => {
      return;
    }),
    getSettings: mock.fn(async (_options?: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> => {
      return {
        name: exampleMedia.provider,
        label: 'Mock Provider',
        status: SettingsStatus.Ok,
        statusMessage: 'Mock provider for testing',
      };
    }),
  },
};

/**
 * Mock calls to Media Persistor
 */
export const MediaPersistorMock: ProviderMock<MediaPersistor> = {
  provide: MediaPersistor,
  useValue: {
    find: mock.fn(async () => {
      return exampleMedia;
    }),
    list: mock.fn(async (options?: { where: any }) => {
      let items = [exampleMedia];
      if (Array.isArray(options?.where.id)) {
        items = options?.where.id.map((id: string) => ({ ...exampleMedia, id }));
      }
      if (Array.isArray(options?.where.key)) {
        items = options?.where.key.map((key: string) => ({ ...exampleMedia, key }));
      }
      return items;
    }),
    create: mock.fn(async (a) => {
      return {
        createdAt: new Date(),
        ...a,
      };
    }),
    update: mock.fn(async (a, b) => {
      return { ...exampleMedia, ...a, ...b };
    }),
    paginate: mock.fn(async (options?: IMediaPaginationQuery): Promise<IPagination<IMedia>> => {
      let items = [exampleMedia];
      if (Array.isArray(options?.filter?.ids)) {
        items = options?.filter?.ids.map((id: string) => ({ ...exampleMedia, id }));
      }
      return { items, totalItems: items.length, limit: items.length };
    }),
    delete: mock.fn(async (_where: { id: string }): Promise<void> => {
      return;
    }),
    markForDeletion: mock.fn(async (_where: { id: string }): Promise<IMedia | null> => {
      return null;
    }),
    count: mock.fn(
      async (
        where?: {
          type?: string | string[];
          module?: string | string[];
          mimeType?: string | string[];
          userId?: string | string[];
          provider?: string | string[];
        },
        options?: { groupBy?: 'type' | 'module' | 'provider' | 'userId' | 'mimeType' },
      ): Promise<Record<string, number> & { total?: number }> => {
        // Mock implementation for count method
        if (options?.groupBy) {
          // Return grouped counts
          const groupByField = options.groupBy;
          if (groupByField === 'type') {
            return { image: 5, document: 3 };
          } else if (groupByField === 'module') {
            return { 'user-profile': 4, blog: 4 };
          } else if (groupByField === 'provider') {
            return { 'mock-provider': 8 };
          }
          return {};
        }
        // Return total count
        return { total: 8 };
      },
    ),
    listLabels: mock.fn(async (query: { field: 'module' | 'type' | 'mimeType'; search?: string; limit?: number }) => {
      if (query.field === 'module') {
        return [
          { id: 'user-profile', label: 'user-profile' },
          { id: 'blog', label: 'blog' },
          { id: 'product', label: 'product' },
        ];
      } else if (query.field === 'type') {
        return [
          { id: 'avatar', label: 'avatar' },
          { id: 'thumbnail', label: 'thumbnail' },
          { id: 'banner', label: 'banner' },
        ];
      } else {
        return [
          { id: 'image/jpeg', label: 'image/jpeg' },
          { id: 'image/png', label: 'image/png' },
          { id: 'application/pdf', label: 'application/pdf' },
          { id: 'text/plain', label: 'text/plain' },
        ];
      }
    }),
  },
};
