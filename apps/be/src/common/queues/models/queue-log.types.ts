import { JsonUObject } from '~common/types';

export interface IQueueLog {
  event: 'enqueue' | 'execute' | 'completed';
  job?: JsonUObject;
  duration?: number;
}
