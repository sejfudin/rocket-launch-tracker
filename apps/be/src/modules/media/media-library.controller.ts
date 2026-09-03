import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnIdentity, IAuthnIdentity } from '~common/authn';
import { MediaUploadRequest } from '~common/media';
import { MEDIA_REST_PREFIX } from '~common/media/media.constants';

import { UserCheck } from '~modules/users/auth';

import { MediaLibraryService } from './media-library.service';

@ApiTags('Media')
@Controller(MEDIA_REST_PREFIX)
export class MediaLibraryController {
  constructor(private readonly mediaLibraryService: MediaLibraryService) {}

  /**
   * Request upload instructions for a new media file
   */
  @Post('presigned-url')
  @UserCheck()
  async uploadRequest(@Body() dto: MediaUploadRequest, @AuthnIdentity() identity: IAuthnIdentity) {
    return await this.mediaLibraryService.uploadRequest(identity.userId, dto);
  }
}
