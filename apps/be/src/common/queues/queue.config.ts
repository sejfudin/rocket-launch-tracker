import { Expose } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

import { ConfigDecorator } from '~common/config';
import { BaseLogLevelEnum } from '~common/logger';
import { QueueLogDetail } from '~common/queues/models/queue-config.types';

@ConfigDecorator('queues')
export class QueueConfig {
  /**
   * Queue logging level
   * - none: do not log queue jobs
   * - error: log only failed queue jobs
   * - debug: log all queue jobs (successful and failed)
   */
  @Expose()
  @IsEnum(BaseLogLevelEnum)
  @IsOptional()
  logLevel: BaseLogLevelEnum = BaseLogLevelEnum.error;

  /**
   * Queue log detail level - controls how much data is logged
   * - basic: store only basic information (id, processor, status)
   * - payload: store basic information and payload
   */
  @Expose()
  @IsEnum(QueueLogDetail)
  @IsOptional()
  logDetail: QueueLogDetail = QueueLogDetail.BASIC;
}
