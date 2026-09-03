import { Module } from '@nestjs/common';

import { getConfigFactory } from '~common/config';
import { MediaConfig, MediaModule } from '~common/media';

import { MediaAdminController } from './media-admin.controller';
import { MediaAdminService } from './media-admin.service';

@Module({
  imports: [MediaModule.forFeature()],
  providers: [MediaAdminService, getConfigFactory(MediaConfig)],
  controllers: [MediaAdminController],
})
export class MediaAdminModule {}
