import { applyDecorators } from '@nestjs/common';
import { ApiExtension } from '@nestjs/swagger';

export function ApiMediaUpload() {
  return applyDecorators(ApiExtension('x-media-upload', true));
}
