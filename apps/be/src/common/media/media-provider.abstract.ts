import { Readable } from 'node:stream';

import { ISettingsSection, SettingsPopulate } from '~common/settings';
import type { JsonObject } from '~common/types';

import type {
  IMediaConstraints,
  IMediaFetchInstructions,
  IMediaFile,
  IMediaUploadInstructions,
} from './models/media.types';

export abstract class MediaProvider {
  abstract readonly name: string;

  getMeta?(
    key: string,
    options?: {
      providerOptions?: {
        bucket?: string;
      };
    },
  ): Promise<{ fileSize?: number; mimeType?: string }>;

  createUploadRequest?(
    file: IMediaFile,
    options: {
      // file key
      key: string;

      // suggested upload method
      method?: string;

      // arbitrary options for the provider
      providerOptions?: JsonObject;

      constraints?: IMediaConstraints;
    },
  ): Promise<Omit<IMediaUploadInstructions, 'id'>>;

  upload?(
    stream: Readable,
    file: IMediaFile,
    options: {
      // file key
      key: string;

      // arbitrary options for the provider
      providerOptions?: JsonObject;

      constraints?: IMediaConstraints;
    },
  ): Promise<{ key: string }>;

  createFetchRequest?(
    data: { key: string },
    options: {
      // arbitrary options for the provider
      providerOptions?: JsonObject;
    },
  ): Promise<Omit<IMediaFetchInstructions, 'id'>>;

  download?(
    key: string,
    options?: {
      // arbitrary options for the provider
      providerOptions?: JsonObject;
    },
  ): Promise<{
    stream: Readable;
    fileSize: number;
    mimeType: string;
  }>;

  delete?(key: string, options?: { providerOptions?: JsonObject }): Promise<void>;

  abstract getSettings?(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection>;
}
