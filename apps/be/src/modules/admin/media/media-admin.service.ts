import { Injectable } from '@nestjs/common';

import { NotFoundException } from '~common/exceptions';
import { PaginationDto } from '~common/http/pagination';
import { LoggerService } from '~common/logger';
import { IMedia, IMediaPaginationQuery, MediaService, MediaUploadInstructionsResponse } from '~common/media';
import { MediaLabelsRequest } from '~common/media/models/media-labels.request';

import { MediaLibrary } from '~modules/media';

import { MediaAdminResponse } from './models/media-admin.response';
import { IMediaAdminLibraryResponse } from './models/media-admin-library.response';
import { MediaAdminUploadRequest } from './models/media-admin-upload.request';

@Injectable()
export class MediaAdminService {
  constructor(
    private readonly mediaService: MediaService,
    private readonly logger: LoggerService,
  ) {}

  async paginate(query: IMediaPaginationQuery): Promise<PaginationDto<MediaAdminResponse>> {
    const result = await this.mediaService.paginate(query);
    return PaginationDto.fromDomain(result, MediaAdminResponse.fromDomain);
  }

  async find(mediaId: string): Promise<MediaAdminResponse> {
    const media = await this.mediaService.find({ id: mediaId });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const mediaFetchInstructions = await this.mediaService.createMediaFetchRequest({ id: media.id }, media);

    return MediaAdminResponse.fromDomain({
      ...media,
      url: mediaFetchInstructions.url,
    });
  }

  async requestUpload(data: MediaAdminUploadRequest): Promise<MediaUploadInstructionsResponse> {
    const { method, ...media } = data;

    const instructions = await this.mediaService.createMediaUploadRequest(media, { method });

    return MediaUploadInstructionsResponse.fromDomain(instructions);
  }

  async delete(mediaId: string): Promise<void> {
    const media = await this.mediaService.markForDeletion({ id: mediaId });
    if (media) {
      await this.mediaService.deleteMedia(media).catch((error) => {
        this.logger.error('Failed to delete media', error);
      });
    }
  }

  async bulkDelete(mediaIds: string[]): Promise<void> {
    const medias = await Promise.all(mediaIds.map((mediaId) => this.mediaService.markForDeletion({ id: mediaId })));
    await Promise.all(
      medias.filter((media): media is IMedia => media !== null).map((media) => this.mediaService.deleteMedia(media)),
    ).catch((error) => {
      this.logger.error('Failed to delete media', error);
    });
  }

  async library(): Promise<IMediaAdminLibraryResponse> {
    const counts = await this.mediaService.count(
      { resourceName: Object.values(MediaLibrary).map((x) => x.name) },
      { groupBy: 'resourceName' },
    );

    return {
      types: Object.entries(MediaLibrary).map(([label, { mimeTypes, fileSize, name }]) => ({
        name,
        label,
        mimeTypes,
        fileSize,
        count: name in counts ? counts[name] : 0,
      })),
    };
  }

  async listLabels(query: MediaLabelsRequest): Promise<{ id: string; label: string }[]> {
    return await this.mediaService.listLabels(query);
  }
}
