import { Injectable } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';
import { MediaService, MediaUploadInstructionsResponse, MediaUploadRequest } from '~common/media';

import { MediaLibrary } from './media-library.constants';

@Injectable()
export class MediaLibraryService {
  constructor(private readonly mediaService: MediaService) {}

  async uploadRequest(userId: string, data: MediaUploadRequest) {
    if (!data.resourceName) {
      throw new BadRequestException('Missing ResourceName');
    }

    const constraints = Object.values(MediaLibrary).find((x) => x.name === data.resourceName);

    if (!constraints) {
      throw new BadRequestException('Invalid ResourceName');
    }

    const instructions = await this.mediaService.createMediaUploadRequest(
      {
        resourceName: data.resourceName,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        userId: userId,
      },
      { constraints, method: data.method },
    );
    return new MediaUploadInstructionsResponse(instructions);
  }
}
