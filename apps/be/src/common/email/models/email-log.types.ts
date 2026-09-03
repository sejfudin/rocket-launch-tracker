import { BaseLogLevelEnum } from '~common/logger';
import { JsonObject } from '~common/types';

import { IEmailSendResponse } from './email.types';

export enum EmailLogEvent {
  SENT = 'sent',
  FAILED = 'failed',
  SUPPRESSED = 'suppressed',
}

export interface IEmailLog {
  event: EmailLogEvent;
  level: BaseLogLevelEnum;

  provider?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  from?: string;
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  template?: string;
  templateValues?: JsonObject;
  templateOptions?: JsonObject;

  response?: IEmailSendResponse;
  failedMessage?: string;
}
