import { Readable } from 'node:stream';

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';

import { PrismaMediaProviderConfig } from '~common/media/providers/prisma/prisma-media.provider.config';

import { PrismaMediaProviderUploadDto } from './dtos/prisma-media-provider-upload.dto';
import { PrismaMediaProvider } from './prisma-media.provider';

@ApiTags('Media')
@Controller('media/provider/prisma')
export class PrismaMediaProviderController {
  constructor(
    private readonly prismaMediaProvider: PrismaMediaProvider,
    private readonly config: PrismaMediaProviderConfig,
  ) {}

  @Post('upload')
  @FormDataRequest()
  @ApiExcludeEndpoint()
  @HttpCode(204)
  async upload(@Body() { token, file }: PrismaMediaProviderUploadDto): Promise<void> {
    const blobStream = Readable.from(file.buffer);
    await this.prismaMediaProvider.uploadWithToken(await token, blobStream);
  }

  @ApiExcludeEndpoint()
  @Get('fetch/*key')
  async fetch(
    @Param('key') key: string,
    @Query('token') token: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    let media;
    if (token) {
      media = await this.prismaMediaProvider.downloadWithToken(token);
    } else if (this.config.signFetch) {
      throw new BadRequestException('Token required for signed fetch');
    } else {
      media = await this.prismaMediaProvider.download(key.replaceAll(',', '/'));
    }

    if (this.config.cacheControl) {
      res.setHeader('Cache-Control', this.config.cacheControl);
    }

    return new StreamableFile(media.stream, {
      type: media.mimeType,
      length: media.fileSize,
      disposition: `attachment`,
    });
  }
}
