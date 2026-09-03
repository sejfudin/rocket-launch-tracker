import { Body, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import { MediaService, MediaUploadInstructionsResponse } from '~common/media';
import { ApiMediaUpload } from '~common/media/decorators/media-upload.decorator';
import { MediaLabelsRequest } from '~common/media/models/media-labels.request';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelResponse } from '~modules/admin/common/models';

import { MediaAdminService } from './media-admin.service';
import { MEDIA_ADMIN_API_TAG } from './media-admin.types';
import { MediaAdminResponse } from './models/media-admin.response';
import { MediaAdminBulkDeleteRequest } from './models/media-admin-bulk-delete.request';
import { MediaAdminLibraryResponse } from './models/media-admin-library.response';
import { MediaAdminPaginationQueryDto } from './models/media-admin-pagination.request';
import { MediaAdminUploadRequest } from './models/media-admin-upload.request';

@AdminController('media', { tags: MEDIA_ADMIN_API_TAG })
export class MediaAdminController {
  constructor(
    private readonly mediaAdminService: MediaAdminService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('library')
  @AdminUserAclCheck('media:upload')
  async library(): Promise<MediaAdminLibraryResponse> {
    return MediaAdminLibraryResponse.fromDomain(await this.mediaAdminService.library());
  }

  /**
   * Get labels for dropdowns/selects
   */
  @Get('labels')
  @AdminUserAclCheck('media:read')
  async listLabels(@Query() query: MediaLabelsRequest): Promise<LabelResponse[]> {
    const labels = await this.mediaAdminService.listLabels(query);
    return labels.map(LabelResponse.fromDomain);
  }

  @Get()
  @AdminUserAclCheck('media:read')
  @ApiPaginationResponse(MediaAdminResponse)
  async paginate(@Query() query: MediaAdminPaginationQueryDto): Promise<PaginationDto<MediaAdminResponse>> {
    return this.mediaAdminService.paginate(query);
  }

  @Get(':id')
  @AdminUserAclCheck('media:read')
  async find(@Param('id') mediaId: string): Promise<MediaAdminResponse> {
    return this.mediaAdminService.find(mediaId);
  }

  @Post()
  @AdminUserAclCheck('media:upload')
  @ApiMediaUpload()
  async upload(@Body() body: MediaAdminUploadRequest): Promise<MediaUploadInstructionsResponse> {
    return this.mediaAdminService.requestUpload(body);
  }

  @Post('bulk-delete')
  @AdminUserAclCheck('media:delete')
  @ApiResponse({ status: 204, description: 'Media bulk deleted' })
  @HttpCode(204)
  async bulkDelete(@Body() data: MediaAdminBulkDeleteRequest): Promise<void> {
    await this.mediaAdminService.bulkDelete(data.ids);
  }

  @Delete(':id')
  @AdminUserAclCheck('media:delete')
  @ApiResponse({ status: 204, description: 'Media deleted' })
  @HttpCode(204)
  async delete(@Param('id') mediaId: string): Promise<void> {
    await this.mediaAdminService.delete(mediaId);
  }
}
