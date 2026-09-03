import { Injectable, ModuleMetadata } from '@nestjs/common';

import { BadRequestException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import { JsonObject } from '~common/types';

import { PrismaModule, PrismaService, paginationToPrismaQuery, prismaResultToPagination } from '~database/prisma';
import { Prisma, QueueJob } from '~database/prisma/client';

import { IQueueJob, IQueueJobOptions, IQueueJobPaginationQuery, IQueueJobUpdate, QueueJobStatus } from '../../models';
import { QueuePersistor } from '../../queue-persistor.abstract';

@Injectable()
export class QueueJobPrismaRepository implements QueuePersistor {
  constructor(private readonly prismaService: PrismaService) {}

  public static toDomain(data: QueueJob): IQueueJob {
    return {
      id: data.id,
      processor: data.processor,
      queue: data.queue ?? undefined,
      options: data.options as IQueueJobOptions,
      payload: data.payload as JsonObject | undefined,
      status: data.status as QueueJobStatus,
      result: data.result as JsonObject | undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      startAfter: data.startAfter as Date | undefined,
      startedAt: data.startedAt as Date | undefined,
      doneAt: data.doneAt as Date | undefined,
    };
  }

  async upsert(data: IQueueJob, tx?: Prisma.TransactionClient): Promise<IQueueJob> {
    const client = tx || this.prismaService.client;
    const job = await client.queueJob.upsert({
      where: { id: data.id },
      update: {
        processor: data.processor,
        queue: data.queue,
        payload: data.payload as Prisma.InputJsonValue,
        options: data.options as Prisma.InputJsonValue,
        status: data.status || QueueJobStatus.QUEUED,
        startAfter: data.startAfter,
      },
      create: {
        id: data.id,
        processor: data.processor,
        queue: data.queue,
        payload: data.payload as Prisma.InputJsonValue,
        options: data.options as Prisma.InputJsonValue,
        status: data.status || QueueJobStatus.QUEUED,
        startAfter: data.startAfter,
      },
    });
    return QueueJobPrismaRepository.toDomain(job);
  }

  async find(where: { id: string }, tx?: Prisma.TransactionClient): Promise<IQueueJob | null> {
    const client = tx || this.prismaService.client;
    const job = await client.queueJob.findUnique({
      where: { id: where.id },
    });
    return job ? QueueJobPrismaRepository.toDomain(job) : null;
  }

  async update(id: string, data: IQueueJobUpdate, tx?: Prisma.TransactionClient): Promise<IQueueJob> {
    const client = tx || this.prismaService.client;

    const update: Prisma.QueueJobUpdateInput = {};

    for (const key of Object.keys(data)) {
      switch (key) {
        case 'status':
          update.status = data.status;
          break;
        case 'result':
          update.result = data.result as Prisma.InputJsonValue;
          break;
        case 'doneAt':
          update.doneAt = data.doneAt;
          break;
        default:
          throw new BadRequestException(`Invalid update key: ${key}`, { code: 'invalid-update-key' });
      }
    }

    const queueJob = await client.queueJob.update({
      where: { id },
      data: update,
    });
    return QueueJobPrismaRepository.toDomain(queueJob);
  }

  async paginate(query: IQueueJobPaginationQuery, tx?: Prisma.TransactionClient): Promise<IPagination<IQueueJob>> {
    const client = tx || this.prismaService.client;
    const where: Prisma.QueueJobWhereInput = {};

    for (const [key, value] of query.filter ? Object.entries(query.filter) : []) {
      if (!value) {
        continue;
      }
      switch (key) {
        case 'ids':
          where.id = { in: value };
          break;
        case 'processor':
        case 'queue':
        case 'status':
          where[key] = value;
          break;
        case 'search':
          where.OR = value ? [{ processor: { contains: value, mode: 'insensitive' } }] : undefined;
          break;
        default:
          throw new BadRequestException(`Invalid filter key: ${key}`, { code: 'invalid-filter-key' });
      }
    }

    const items = await client.queueJob.findMany({
      where,
      ...(paginationToPrismaQuery(query) as Prisma.QueueJobFindManyArgs),
    });

    const totalItems = await client.queueJob.count({ where });

    return {
      items: items.map(QueueJobPrismaRepository.toDomain),
      ...prismaResultToPagination(query, { items, totalItems }),
    };
  }

  async cancel(where: { id: string }, tx?: Prisma.TransactionClient): Promise<IQueueJob> {
    const client = tx || this.prismaService.client;
    const job = await client.queueJob.update({
      where: {
        id: where.id,
        status: {
          in: [QueueJobStatus.QUEUED],
        },
      },
      data: { status: QueueJobStatus.CANCELLED, startedAt: null, doneAt: new Date() },
    });
    return QueueJobPrismaRepository.toDomain(job);
  }

  async listUpcoming(maxStartTime?: Date, tx?: Prisma.TransactionClient): Promise<IQueueJob[]> {
    const client = tx || this.prismaService.client;
    const where: Prisma.QueueJobWhereInput = {
      status: {
        in: [QueueJobStatus.QUEUED],
      },
    };
    if (maxStartTime) {
      where.startAfter = { lte: maxStartTime };
    }
    const jobs = await client.queueJob.findMany({ where, orderBy: { startAfter: 'asc' } });

    return jobs.map(QueueJobPrismaRepository.toDomain);
  }

  async start(id: string, tx?: Prisma.TransactionClient): Promise<IQueueJob | null> {
    const client = tx || this.prismaService.client;
    const result = await client.queueJob.update({
      where: {
        id,
        status: {
          in: [QueueJobStatus.QUEUED],
        },
      },
      data: {
        status: QueueJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    if (result === null) {
      return null;
    }

    return QueueJobPrismaRepository.toDomain(result);
  }

  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prismaService.client.$transaction(fn);
  }
}

export const PrismaQueuePersistorPlugin: ModuleMetadata = {
  imports: [PrismaModule.forRoot()],
  providers: [{ provide: QueuePersistor, useClass: QueueJobPrismaRepository }],
  exports: [QueuePersistor],
};
