import { HttpStatus } from '@nestjs/common';

import { BaseException, type IBaseException } from '~common/exceptions/base.exception';
import { JsonUObject } from '~common/types';

export class PushNotificationError extends BaseException {
  public details: unknown;

  constructor(message?: string, input?: IBaseException & { details?: JsonUObject }) {
    super(message ?? 'Push Notification Error', {
      code: 'push-notification-error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...input,
    });

    this.details = input?.details;
  }
}
