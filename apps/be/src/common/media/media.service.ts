import { Readable } from 'node:stream';

import { Injectable } from '@nestjs/common';
import * as mime from 'mime-types';

import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import { MediaProvider } from '~common/media/media-provider.abstract';
import type { JsonObject } from '~common/types';
import { makeUUID } from '~common/utils/short-uuid';

import { Transaction } from '~database/types';

import { MediaConfig } from './media.config';
import { MediaError } from './media.exceptions';
import { MediaLoader } from './media.loader';
import { MediaPersistor } from './media-persistor.abstract';
import type {
  IMedia,
  IMediaAssociation,
  IMediaAttachRequest,
  IMediaConstraints,
  IMediaFetchInstructions,
  IMediaFetchRequest,
  IMediaFile,
  IMediaId,
  IMediaPaginationQuery,
  IMediaResourceName,
  IMediaUploadInstructions,
  IMediaUploadRequest,
  INamedIMediaConstraints,
} from './models';
import { MediaLabelsRequest } from './models/media-labels.request';

type Optional<T, K extends keyof T> = Omit<T, K> & { [P in keyof T]?: T[P] | undefined };

@Injectable()
export class MediaService {
  public defaultProvider?: string;

  constructor(
    private readonly mediaPersistor: MediaPersistor,
    private readonly mediaLoader: MediaLoader,
    private readonly mediaConfig: MediaConfig,
  ) {
    this.defaultProvider = this.mediaConfig.defaultProvider;
  }

  /**
   * Get a media file
   */
  public async find(where: { id: string } | { key: string }, tx?: Transaction): Promise<IMedia | null> {
    return this.mediaPersistor.find(where, tx);
  }

  /**
   * Counts the number of media based on specified filtering
   */
  public count(
    where?: {
      type?: string | string[];
      module?: string | string[];
      mimeType?: string | string[];
      userId?: string | string[];
      provider?: string | string[];
      resourceName?: string | string[];
    },
    options?: { groupBy?: 'type' | 'module' | 'provider' | 'userId' | 'mimeType' | 'resourceName' },
    tx?: Transaction,
  ): Promise<Record<string, number> & { total?: number }> {
    if (!this.mediaPersistor.count) {
      throw new MediaError('Media count not supported', { code: 'media-count-not-supported' });
    }
    return this.mediaPersistor.count(where, options, tx);
  }

  /**
   * List labels for modules, types, or mime types
   */
  public async listLabels(query: MediaLabelsRequest): Promise<Array<{ id: string; label: string }>> {
    return this.mediaPersistor.listLabels(query);
  }

  /**
   * Get a list of media files filtered by match options
   */
  public async list(
    options: {
      where: {
        id?: IMediaId | IMediaId[];
        key?: string | string[];
        resourceName?: IMediaResourceName;
        module?: string;
        type?: string;
        resourceId?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        uploaded?: boolean;
        validated?: boolean;
        provider?: string;
      };
      take?: number;
      skip?: number;
    },
    tx?: Transaction,
  ): Promise<IMedia[]> {
    return this.mediaPersistor.list({ take: 10, skip: 0, ...options }, tx);
  }

  /**
   * Get paginated media files
   */
  public async paginate(query: IMediaPaginationQuery): Promise<IPagination<IMedia>> {
    return this.mediaPersistor.paginate(query);
  }

  /**
   * Mark media for deletion
   */
  public async markForDeletion(where: { id: string }, tx?: Transaction): Promise<IMedia | null> {
    return await this.mediaPersistor.markForDeletion({ id: where.id }, tx);
  }

  /**
   * Delete a media from the persistor and provider
   */
  public async deleteMedia(media: IMedia): Promise<void> {
    const providerInstance = this.getProvider(media.provider);

    try {
      if (providerInstance.delete) {
        await providerInstance.delete(media.key);
      }
      await this.mediaPersistor.delete({ id: media.id });
    } catch (error) {
      throw new MediaError('Failed to delete media from provider', {
        code: 'media-provider-delete-failed',
        cause: error,
        details: { provider: providerInstance.name, key: media.key },
      });
    }
  }

  /**
   * Upload a media and register it in the persistor
   */
  public async uploadMedia(
    buffer: Readable,
    data: Optional<IMediaAssociation & IMediaUploadRequest, 'mimeType'> & {
      resourceName: IMediaResourceName;
    },
    options: {
      key?: string;
      constraints?: IMediaConstraints;
      provider?: string;
      providerOptions?: Record<string, JsonObject>;
    } = {},
  ): Promise<IMedia> {
    const providerInstance = this.getProvider(options.provider);
    if (!providerInstance.upload) {
      throw new MediaError('Upload not supported', { code: 'media-provider-upload-not-supported' });
    }

    if (!data.resourceName) {
      throw new MediaError('Resource name not provided', { code: 'media-resource-name-not-provided' });
    }

    const id = makeUUID();
    const key = options.key || `${data.resourceName}/${id}`;
    const mimeType = data.mimeType || mime.lookup(data.fileName) || 'application/octet-stream';

    if (options.constraints) {
      await this.validateConstraints({ ...data, mimeType }, options.constraints);
    }

    const media = await this.mediaPersistor.create({ ...data, id, key, mimeType, provider: providerInstance.name });

    // upload file to provider
    await providerInstance.upload(buffer, { ...data, mimeType }, { ...options, key });

    // mark as uploaded and validated
    return await this.mediaPersistor.update({ id: media.id }, { uploaded: new Date(), validated: new Date() });
  }

  /**
   * Create a new media file and return upload instructions
   *  - provides all the necessary authorization
   */
  public async createMediaUploadRequest(
    data: Optional<IMediaAssociation & IMediaUploadRequest, 'mimeType'> & { resourceName: IMediaResourceName },
    options: {
      key?: string;
      method?: string;
      constraints?: IMediaConstraints;
      provider?: string;
      providerOptions?: Record<string, JsonObject>;
    } = {},
  ): Promise<IMediaUploadInstructions> {
    const providerInstance = this.getProvider(options.provider);

    if (!providerInstance.createUploadRequest) {
      throw new MediaError('Create upload request not supported', {
        code: 'media-provider-create-upload-request-not-supported',
      });
    }

    const id = makeUUID();
    const key = options.key || `${data.resourceName}/${id}`;
    const mimeType = data.mimeType || mime.lookup(data.fileName) || 'application/octet-stream';

    if (!data.resourceName) {
      throw new MediaError('Resource name not provided', { code: 'media-resource-name-not-provided' });
    }

    // enhancement: get registered constraints, or from the resource
    //  - modules could register their constraints using @MediaConstraints decorator, then be able to use a
    //  string as a constraint name
    //  - another option is to register a prefix, and a handler function, that will be called at media creation

    // validate request constraints
    await this.validateConstraints({ ...data, mimeType }, options.constraints);

    // create media record
    await this.mediaPersistor.create({ ...data, id, key, mimeType, provider: providerInstance.name });

    return {
      ...(await providerInstance.createUploadRequest({ ...data, mimeType }, { ...options, key })),
      id,
    };
  }

  /**
   * Download a media file and return the stream
   */
  public async downloadMedia(
    media: IMediaId | IMedia,
    options: {
      providerOptions?: Record<string, JsonObject>;
    } = {},
    tx?: Transaction,
  ): Promise<{
    stream: Readable;
    media: IMedia;
  }> {
    const id = typeof media === 'string' ? media : media.id;
    const mediaRecord = typeof media === 'string' ? await this.find({ id }, tx) : media;

    if (!mediaRecord) {
      throw new BadRequestException('Media not found');
    }

    const providerInstance = this.getProvider(mediaRecord.provider);
    if (!providerInstance.download) {
      throw new MediaError('Download not supported', { code: 'media-provider-download-not-supported' });
    }

    if (!providerInstance.download) {
      throw new MediaError('Download not supported', { code: 'media-provider-download-not-supported' });
    }

    try {
      const downloadResult = await providerInstance.download(mediaRecord.key, options);
      return {
        stream: downloadResult.stream,
        media: mediaRecord,
      };
    } catch (error) {
      throw new MediaError('Failed to download media from provider', {
        code: 'media-provider-download-failed',
        cause: error,
        details: { provider: providerInstance.name, key: mediaRecord.key },
      });
    }
  }

  /**
   * Create a fetch request for a media file
   *  - returns fetch instructions
   *  - provides all the necessary authorization
   */
  async createMediaFetchRequest(
    data: IMediaFetchRequest,
    media?: IMedia,
    options: {
      providerOptions?: Record<string, JsonObject>;
      throw?: boolean;
    } = {},
    tx?: Transaction,
  ): Promise<IMediaFetchInstructions> {
    if (!media) {
      const foundMedia = await this.find({ id: data.id }, tx);
      if (!foundMedia) {
        throw new BadRequestException('Media not found');
      }
      media = foundMedia;
    }
    if (data.resourceName && media.resourceName !== data.resourceName) {
      if (options.throw) {
        throw new MediaError('Media resource name mismatch', { code: 'media-resource-name-mismatch' });
      } else {
        return {
          error: 'media-resource-name-mismatch',
        };
      }
    }

    try {
      const providerInstance = this.getProvider(media.provider);
      if (!providerInstance.createFetchRequest) {
        throw new MediaError('Create fetch request not supported', {
          code: 'media-provider-create-fetch-request-not-supported',
        });
      }
      const fetchInstructions = await providerInstance.createFetchRequest({ key: media.key }, options);
      return {
        ...fetchInstructions,
        id: media.id,
        url: fetchInstructions.url,
      };
    } catch (error: any) {
      if (options.throw) {
        throw error;
      } else {
        return {
          error: 'message' in error ? error.message : 'unknown',
        };
      }
    }
  }

  /**
   * Create fetch requests in bulk
   */
  public async createMediaFetchRequests(
    media: Array<string | IMedia>,
    options: {
      providerOptions?: Record<string, JsonObject>;
      throws?: boolean;
    } = {},
  ): Promise<Record<string, IMediaFetchInstructions>> {
    const mediaIds = media.filter((item): item is string => typeof item === 'string');
    const combinedMedia = [
      ...media.filter((item): item is IMedia => !!item && typeof item !== 'string' && !!item.id),
      ...(mediaIds.length > 0
        ? await this.list({
            where: { id: mediaIds },
            take: mediaIds.length,
          })
        : []),
    ];
    const fetchRequests: Record<string, IMediaFetchInstructions> = {};
    for (const mediaItem of combinedMedia) {
      fetchRequests[mediaItem.id] = await this.createMediaFetchRequest({ id: mediaItem.id }, mediaItem, options);
    }
    return fetchRequests;
  }

  /**
   * Create fetch requests in bulk and apply them to an object
   */
  public async applyMediaFetchRequests<T = Record<string, unknown>, In = T | T[]>(
    data: In,
    keyProperty: string,
  ): Promise<In> {
    const items = Array.isArray(data) ? data : [data];
    const media = await this.createMediaFetchRequests(
      items
        .map((item) => (item as Record<string, { id?: string }>)[keyProperty]?.id)
        .filter((id): id is string => !!id),
    );
    for (const item of items) {
      const typedItem = item as Record<string, { id?: string }>;
      const mediaId = typedItem[keyProperty]?.id;
      if (mediaId && media[mediaId]) {
        typedItem[keyProperty] = { ...typedItem[keyProperty], ...media[mediaId] };
      }
    }
    return Array.isArray(data) ? (items as In) : (items[0] as In);
  }

  /**
   * Validate the upload
   *  - check if the file exists and matches the constraints
   */
  public async validate(
    request: IMediaId | IMediaAttachRequest,
    resource?: IMediaResourceName | INamedIMediaConstraints,
    media?: IMedia,
    tx?: Transaction,
  ): Promise<IMedia> {
    const id = typeof request === 'string' ? request : request.id;
    if (!media) {
      const foundMedia = await this.find({ id }, tx);
      if (!foundMedia) {
        throw new BadRequestException('Media not found');
      }
      media = foundMedia;
    }

    if (media.uploaded && media.validated) {
      // already validated
      return media;
    }

    const resourceName = typeof resource === 'string' ? resource : resource?.name;

    if (resourceName && media.resourceName !== resourceName) {
      throw new MediaError('Media file mismatch', { code: 'media-file-mismatch' });
    }

    const providerInstance = this.getProvider(media.provider);
    if (!providerInstance.getMeta) {
      throw new MediaError('Get meta not supported', { code: 'media-provider-get-meta-not-supported' });
    }

    // check if file exists, and is the same as the one in the media record
    const { fileSize, mimeType } = await providerInstance.getMeta(media.key);

    if (media.fileSize !== fileSize || media.mimeType !== mimeType) {
      // enhancement, file size within % ?
      // enhancement, mime type equivalence ?
      // enhancement, soft validation ?
      throw new MediaError('Media file validation error', { code: 'media-file-validation-error' });
    }

    // all good !
    return await this.mediaPersistor.update({ id: media.id }, { uploaded: new Date(), validated: new Date() }, tx);
  }

  /**
   * Associate an existing media file with a resource
   */
  public async associate(
    media: IMediaId | IMedia,
    association: IMediaAssociation,
    options?: {
      override: boolean;
    },
    tx?: Transaction,
  ): Promise<IMedia> {
    if (typeof media === 'string') {
      const foundMedia = await this.find({ id: media });
      if (!foundMedia) {
        throw new BadRequestException('Media not found');
      }
      media = foundMedia;
    }

    if (Object.entries(association).some(([key, value]) => value && media[key as keyof IMedia] === value)) {
      // noting to do
      return media;
    }

    if (
      !options?.override &&
      Object.entries(association).some(
        ([key, value]) => value && media[key as keyof IMedia] && media[key as keyof IMedia] !== value,
      )
    ) {
      throw new BadRequestException('Media association conflict', { code: 'media-association-conflict' });
    }

    return await this.mediaPersistor.update({ id: media.id }, { ...association }, tx);
  }

  private async validateConstraints(media: IMediaFile, constraints?: IMediaConstraints) {
    if (!media.fileSize) {
      throw new MediaError('File size not provided', { code: 'media-file-size-not-provided' });
    }

    if (constraints?.fileSize && media.fileSize > constraints?.fileSize) {
      // enhancement, global max ?
      throw new MediaError('File size exceeded', { code: 'media-file-size-exceeded' });
    }

    if (!media.fileName) {
      throw new MediaError('File name not provided', { code: 'media-file-name-not-provided' });
    }

    if (!media.mimeType) {
      throw new MediaError('Mime type not provided', { code: 'media-mime-type-not-provided' });
    }

    // enhancement, global forbidden mime types
    if (constraints?.mimeTypes) {
      const [type, subtype] = media.mimeType.split('/');
      if (
        !constraints?.mimeTypes.some((m) => {
          const [allowedType, allowedSubtype] = m.split('/');
          return type === allowedType && (allowedSubtype === '*' || subtype === allowedSubtype);
        })
      ) {
        throw new MediaError('Mime type not allowed', {
          code: 'media-mime-type-not',
        });
      }
    }
  }

  /**
   * Create a provider upload request  (bypass the media persistor)
   * @see createMediaUploadRequest - use the managed function for normal use
   */
  public async createProviderUploadRequest(
    data: Optional<IMediaFile, 'mimeType'>,
    options: {
      key?: string;
      method?: string;
      provider?: string;
      providerOptions?: Record<string, JsonObject>;
    } = {},
  ): Promise<Omit<IMediaUploadInstructions, 'id'>> {
    const mimeType = data.mimeType || mime.lookup(data.fileName) || 'application/octet-stream';
    const key = options.key || `uncategorized/${makeUUID()}`;

    const providerInstance = this.getProvider(options.provider);

    if (!providerInstance.createUploadRequest) {
      throw new MediaError('Create upload request not supported', {
        code: 'media-provider-create-upload-request-not-supported',
      });
    }

    return await providerInstance.createUploadRequest({ ...data, mimeType }, { ...options, key });
  }

  /**
   * Create a provider fetch request (bypass the media persistor)
   * @see createMediaFetchRequest - use the managed function for normal use
   */
  public async createProviderFetchRequest(
    data: {
      key: string;
    },
    options: {
      provider: string;
      providerOptions?: Record<string, JsonObject>;
    },
  ): Promise<Omit<IMediaFetchInstructions, 'id'>> {
    const providerInstance = this.getProvider(options.provider);

    if (!providerInstance.createFetchRequest) {
      throw new MediaError('Create fetch request not supported', {
        code: 'media-provider-create-fetch-request-not-supported',
      });
    }

    return await providerInstance.createFetchRequest({ key: data.key }, { providerOptions: options.providerOptions });
  }

  /**
   *  Upload file directly to provider (bypass the media persistor)
   *  @see uploadMedia - use the managed function for normal use
   */
  public async providerUpload(
    data: IMediaFile & { stream: Readable },
    options: {
      key?: string;
      constraints?: IMediaConstraints;
      provider?: string;
      providerOptions?: Record<string, JsonObject>;
    } = {},
  ): Promise<void> {
    const providerInstance = this.getProvider(options.provider);
    if (!providerInstance.upload) {
      throw new MediaError(`Upload not supported`, { code: 'media-provider-upload-not-supported' });
    }

    const mimeType = data.mimeType || mime.lookup(data.fileName) || 'application/octet-stream';

    if (options.constraints) {
      await this.validateConstraints({ ...data, mimeType }, options.constraints);
    }

    const key = options.key || `uncategorized/${makeUUID()}`;

    await providerInstance.upload(data.stream, { ...data, mimeType }, { ...options, key });
  }

  /**
   * Download file directly from provider (bypass the media persistor)
   * @see downloadMedia - use the managed function for normal use
   */
  public async providerDownload(
    data: {
      key: string;
    },
    options: {
      provider: string;
      providerOptions?: Record<string, JsonObject>;
    },
  ): Promise<{
    stream: Readable;
    fileSize: number;
    mimeType: string;
  }> {
    const providerInstance = this.getProvider(options.provider);

    if (!providerInstance.download) {
      throw new MediaError('Download not supported', { code: 'media-provider-download-not-supported' });
    }

    try {
      return await providerInstance.download(data.key, {
        providerOptions: options.providerOptions,
      });
    } catch (error) {
      throw new MediaError('Failed to download from provider', {
        code: 'media-provider-download-failed',
        cause: error,
        details: { provider: options.provider, key: data.key },
      });
    }
  }

  private getProvider(provider?: string): MediaProvider {
    const resolvedProvider = provider || this.defaultProvider;
    const providerInstance = resolvedProvider ? this.mediaLoader.providers[resolvedProvider] : undefined;
    if (!providerInstance) {
      throw new MediaError('Media provider not found', {
        code: 'media-provider-not-found',
        details: { provider: resolvedProvider || 'unknown' },
      });
    }
    return providerInstance;
  }
}
