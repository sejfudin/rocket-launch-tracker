import { applyDecorators } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export function ApiMediaDownload() {
  return applyDecorators(ApiExtension('x-media-download', true));
}
