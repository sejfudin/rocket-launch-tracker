import { Injectable, NotFoundException } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { QueueLoader, QueueProvider, QueueService } from '~common/queues';
import type {
  IQueueJob,
  IQueueJobCreate,
  IQueueJobPaginationQuery,
  IQueueProcessor,
  IQueueProcessorPaginationQuery,
} from '~common/queues/models';
import { JsonObject } from '~common/types';

import { ILabelQuery, ILabelResponse } from '~modules/admin/common/models';

@Injectable()
export class QueueAdminService {
  constructor(
    private readonly queueService: QueueService,
    private readonly queueLoader: QueueLoader,
    private readonly queueProvider: QueueProvider,
  ) {}

  async createJob(data: IQueueJobCreate): Promise<IQueueJob<JsonObject>> {
    return await this.queueService.enqueue(data.processor, data.payload || {}, data.options);
  }

  async paginateJobs(query: IQueueJobPaginationQuery) {
    return this.queueProvider.paginate(query);
  }

  async findJob(id: string): Promise<IQueueJob> {
    const job = await this.queueProvider.find({ id });
    if (!job) {
      throw new NotFoundException('Queue job not found');
    }
    return job;
  }

  async cancelJob(where: { id: string }): Promise<IQueueJob> {
    return this.queueProvider.cancel(where);
  }

  async paginateProcessors(query: IQueueProcessorPaginationQuery): Promise<IPagination<IQueueProcessor>> {
    return await this.queueLoader.paginateProcessors(query);
  }

  async listLabels(query: ILabelQuery): Promise<ILabelResponse[]> {
    const limit = query.limit ?? 20;
    let processorNames = Object.keys(this.queueLoader.processors);

    if (query.search) {
      processorNames = processorNames.filter((name) => name.toLowerCase().includes(query.search!.toLowerCase()));
    }

    return processorNames.slice(0, limit).map((name) => ({ id: name, label: name }));
  }
}
