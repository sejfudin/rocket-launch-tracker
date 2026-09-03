import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { IPagination } from '~common/http/pagination';
import { BaseLogLevel, LogLevelOrder, LoggerService } from '~common/logger';
import type { JsonObject } from '~common/types';
import { MetadataService } from '~common/utils/nestjs';

import {
  IQueueJob,
  IQueueLog,
  IQueueProcessor,
  IQueueProcessorPaginationQuery,
  QUEUE_PROCESSOR_CLASS_MARKER,
  QUEUE_PROCESSOR_METADATA,
  QueueLogDetail,
} from './models';
import { QueueConfig } from './queue.config';
import { QueueError } from './queue.exceptions';

interface IQueueProcessorFunction {
  processorSettings: IQueueProcessor;
  processorFunction: (job: IQueueJob) => Promise<JsonObject>;
}

@Injectable()
export class QueueLoader implements OnApplicationBootstrap {
  public readonly processors: Record<string, IQueueProcessorFunction> = {};

  constructor(
    private readonly logger: LoggerService,
    private readonly metadataService: MetadataService,
    private readonly config: QueueConfig,
  ) {}

  onApplicationBootstrap() {
    this.loadProcessors();

    this.logLevels = new Set(LogLevelOrder.slice(0, LogLevelOrder.indexOf(this.config.logLevel) + 1));
  }

  private loadProcessors() {
    for (const { metadata, handler } of this.metadataService.getAllHandlers<
      IQueueProcessor,
      [IQueueJob<JsonObject>],
      JsonObject
    >(QUEUE_PROCESSOR_METADATA, {
      provider: true,
      classMarker: QUEUE_PROCESSOR_CLASS_MARKER,
    })) {
      for (const settings of metadata) {
        if (this.processors[settings.name]) {
          throw new Error(`Duplicate processor '${settings.name}' found`);
        }

        this.logger.log(`Registered processor {${settings.name}}`);

        this.processors[settings.name] = {
          processorSettings: settings,
          processorFunction: handler,
        };
      }
    }
  }

  private logLevels: Set<BaseLogLevel> = new Set();

  public async paginateProcessors(query: IQueueProcessorPaginationQuery): Promise<IPagination<IQueueProcessor>> {
    const processors = Object.values(this.processors).map(({ processorSettings }) => processorSettings);
    return {
      limit: query.limit,
      items: processors,
      page: query.page,
      totalItems: processors.length,
    };
  }

  public async log(context: {
    level: BaseLogLevel;
    event: IQueueLog['event'];
    duration?: number;
    job?: any;
    error?: QueueError;
  }): Promise<{ id: string } | undefined> {
    if (!this.logLevels.has(context.level)) {
      return;
    }

    let job = context.job ?? context.error?.job;
    let payload: IQueueLog = { event: context.event, duration: context.duration };

    if (this.config.logDetail === QueueLogDetail.PAYLOAD) {
      payload.job = job;
    } else {
      payload.job = {
        id: job?.id,
        processor: job?.processor,
      };
    }

    this.logger.send({
      level: context.level,
      data: payload as unknown as Record<string, unknown>,
      error: context?.error?.cause as Error,
    });

    // todo activities
  }
}
