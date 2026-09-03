import { Injectable, type ModuleMetadata } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';

import { MediaPersistor } from '../media-persistor.abstract';
import type { IMedia } from '../models';

@Injectable()
export class NotImplementedMediaPersistor implements MediaPersistor {
  async find(): Promise<IMedia> {
    throw new Error('Method not implemented');
  }
  async list(): Promise<IMedia[]> {
    throw new Error('Method not implemented');
  }
  async create(): Promise<IMedia> {
    throw new Error('Method not implemented');
  }
  async update(): Promise<IMedia> {
    throw new Error('Method not implemented');
  }
  async paginate(): Promise<IPagination<IMedia>> {
    throw new Error('Method not implemented');
  }
  async markForDeletion(): Promise<IMedia> {
    throw new Error('Method not implemented');
  }
  async delete(): Promise<void> {
    throw new Error('Method not implemented');
  }
  async listLabels(): Promise<{ id: string; label: string }[]> {
    return [];
  }
}

export const NotImplementedMediaPersistorPlugin: ModuleMetadata = {
  providers: [{ provide: MediaPersistor, useClass: NotImplementedMediaPersistor }],
  exports: [MediaPersistor],
};
