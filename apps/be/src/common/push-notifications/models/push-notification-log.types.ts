import { BaseLogLevelEnum } from '~common/logger';
import type { JsonObject } from '~common/types';

import { IPushNotificationMessageResponse } from './push-notification.types';

export enum PushNotificationLogEvent {
  SENT = 'sent',
  FAILED = 'failed',
  SUPPRESSED = 'suppressed',
}

export interface IPushNotificationLog {
  event: PushNotificationLogEvent;
  level: BaseLogLevelEnum;

  provider?: string;
  deviceTokens?: string[];
  resourceName?: string;
  title?: string;
  body?: string;
  template?: string;
  templateValues?: JsonObject;
  data?: JsonObject;

  response?: IPushNotificationMessageResponse[];
  failedMessage?: string;
}
