import { Readable } from 'node:stream';

import { describe, it, expect as vitestExpect } from 'vitest';

import type { JsonObject } from '~common/types';
import { makeId } from '~common/utils/short-uuid';

import { MediaProvider } from '../media-provider.abstract';
import type { IMediaFetchInstructions, IMediaFile, IMediaUploadInstructions } from '../models';

export const pngImage = {
  buffer: Buffer.from(
    atob(
      'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAIklEQVQI12N4raiHFTEA8f8PWmgIIYFTB2GjiNaBXQIrAgC1H1qz4fywJQAAAABJRU5ErkJggg==',
    )
      .split('')
      .map((c) => c.charCodeAt(0)),
  ),
  mimeType: 'image/png',
  fileName: 'image.png',
};

export interface MediaProviderTestConfig {
  provider: () => MediaProvider;
  fetchOptions?: {
    providerOptions?: JsonObject;
  };
  uploadOptions?: {
    providerOptions?: JsonObject;
  };
  supportedMethods?: string[];
  downloadHelper?: (
    fetchInstructions: IMediaFetchInstructions,
    expect: typeof vitestExpect,
  ) => Promise<{
    data: Uint8Array;
    fileSize: number;
    mimeType: string;
  }>;
  uploadHelper?: (
    uploadInstructions: Omit<IMediaUploadInstructions, 'id'>,
    data: Blob,
  ) => Promise<{
    status: number;
  }>;
}

export function createMediaProviderTestSuite(config: MediaProviderTestConfig) {
  const { provider, fetchOptions = {}, uploadOptions = {}, supportedMethods = ['post', 'put'] } = config;

  const testFile: IMediaFile = {
    mimeType: pngImage.mimeType,
    fileName: pngImage.fileName,
    fileSize: pngImage.buffer.length,
  };

  const defaultUploadHelper = async (uploadInstructions: Omit<IMediaUploadInstructions, 'id'>, data: Blob) => {
    switch (uploadInstructions.method) {
      case 'post': {
        const formData = new FormData();
        if (uploadInstructions.fields) {
          for (const [k, v] of uploadInstructions.fields) {
            formData.append(k, v);
          }
        }
        formData.append('file', data);
        const uploadResponse = await fetch(uploadInstructions.url!, {
          body: formData,
          method: uploadInstructions.method,
        });
        return {
          status: uploadResponse.status,
        };
      }
      case 'put': {
        const uploadResponse = await fetch(uploadInstructions.url!, { body: data, method: 'PUT' });
        return {
          status: uploadResponse.status,
        };
      }
      default: {
        throw new Error(`Unsupported upload method: ${uploadInstructions.method}`);
      }
    }
  };

  const defaultDownloadHelper = async (
    fetchInstructions: IMediaFetchInstructions,
    expect: any,
  ): Promise<{
    data: Uint8Array;
    fileSize: number;
    mimeType: string;
  }> => {
    if (!fetchInstructions.url) {
      throw new Error('No URL in fetch instructions');
    }

    const fetchResponse = await fetch(fetchInstructions.url);

    expect(fetchResponse.status).toBe(200);

    const downloadedData = new Uint8Array(await fetchResponse.arrayBuffer());

    return {
      data: downloadedData,
      fileSize: parseInt(fetchResponse.headers.get('content-length')!),
      mimeType: fetchResponse.headers.get('content-type') || '',
    };
  };

  const download = config.downloadHelper ?? defaultDownloadHelper;
  const upload = config.uploadHelper ?? defaultUploadHelper;

  describe(`MediaProvider: ${provider.name}`, () => {
    it('should upload directly and fetch it back', async ({ expect }) => {
      const key = `direct-upload-fetch/${makeId()}`;

      const providerInstance = provider();
      if (!providerInstance.upload) {
        throw new Error('upload not supported by provider');
      }
      await providerInstance.upload(Readable.from(pngImage.buffer), testFile, {
        key,
        ...uploadOptions,
      });

      if (!providerInstance.createFetchRequest) {
        throw new Error('createFetchRequest not supported by provider');
      }
      const fetchInstructions = await providerInstance.createFetchRequest(
        { key },
        {
          ...fetchOptions,
        },
      );

      expect(fetchInstructions).toEqual(expect.objectContaining({ url: expect.any(String) }));

      const downloaded = await download(fetchInstructions, expect);

      expect(downloaded.fileSize).toBe(pngImage.buffer.length);
      expect(downloaded.mimeType).toBe(pngImage.mimeType);
    });

    it(
      'should upload using post',
      async ({ expect }) => {
        const key = `small-image/${makeId()}`;
        const providerInstance = provider();
        if (!providerInstance.createUploadRequest) {
          throw new Error('createUploadRequest not supported by provider');
        }
        const uploadInstructions = await providerInstance.createUploadRequest(testFile, {
          key,
          method: 'post',
          ...uploadOptions,
        });
        expect(uploadInstructions).toEqual(expect.objectContaining({ method: 'post' }));

        try {
          expect(uploadInstructions).toEqual(expect.objectContaining({ url: expect.any(String) }));

          const uploadResponse = await upload(
            uploadInstructions,
            new Blob([pngImage.buffer], { type: pngImage.mimeType }),
          );

          expect(uploadResponse.status).toBe(204);
        } catch (error) {
          throw new Error(`Error uploading to presigned post`, { cause: error });
        }

        const providerInstance2 = provider();
        if (!providerInstance2.createFetchRequest) {
          throw new Error('createFetchRequest not supported by provider');
        }
        const fetchInstructions = await providerInstance2.createFetchRequest(
          { key },
          {
            ...fetchOptions,
          },
        );

        await download(fetchInstructions, expect);
      },
      supportedMethods.includes('post') ? undefined : { skip: true },
    );

    it.skipIf(!supportedMethods.includes('put'))('should upload using put', async ({ expect }) => {
      const key = `small-image/${makeId()}`;
      const providerInstance = provider();
      if (!providerInstance.createUploadRequest) {
        throw new Error('createUploadRequest not supported by provider');
      }
      const uploadInstructions = await providerInstance.createUploadRequest(testFile, {
        key,
        method: 'put',
        ...uploadOptions,
      });
      expect(uploadInstructions).toEqual(expect.objectContaining({ method: 'put' }));

      await upload(uploadInstructions, new Blob([pngImage.buffer], { type: pngImage.mimeType }));

      const providerInstance2 = provider();
      if (!providerInstance2.createFetchRequest) {
        throw new Error('createFetchRequest not supported by provider');
      }
      const fetchInstructions = await providerInstance2.createFetchRequest(
        { key },
        {
          ...fetchOptions,
        },
      );

      await download(fetchInstructions, expect);
    });

    it('should download directly', async ({ expect }) => {
      const key = `direct-download/${makeId()}`;

      const providerInstance = provider();
      if (!providerInstance.upload) {
        throw new Error('upload not supported by provider');
      }
      await providerInstance.upload(Readable.from(pngImage.buffer), testFile, {
        key,
        ...uploadOptions,
      });

      if (!providerInstance.download) {
        throw new Error('download not supported by provider');
      }
      const downloadResult = await providerInstance.download(key, {
        ...fetchOptions,
      });

      expect(downloadResult.fileSize).toBe(pngImage.buffer.length);
      expect(downloadResult.mimeType).toBe(pngImage.mimeType);

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResult.stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const downloadedData = Buffer.concat(chunks);

      expect(downloadedData.length).toBe(pngImage.buffer.length);
      expect(downloadedData.equals(pngImage.buffer)).toBe(true);
    });
  });
}
