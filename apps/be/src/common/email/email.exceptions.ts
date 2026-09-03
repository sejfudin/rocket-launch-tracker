import { HttpStatus } from '@nestjs/common';

import { BaseException, type IBaseException } from '~common/exceptions/base.exception';
import type { JsonUObject } from '~common/types';

export class EmailSendError extends BaseException {
  public details: unknown;

  constructor(message?: string, input?: IBaseException & { details?: JsonUObject }) {
    super(message ?? 'Email Send Error', {
      code: 'email-send-error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...input,
    });

    this.details = input?.details;
  }
}

export class EmailProviderSendError extends EmailSendError {
  constructor(message?: string, input?: IBaseException & { details?: JsonUObject }) {
    super(message ?? 'Email Provider Send Error', {
      code: 'email-provider-send-error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...input,
      details: input?.details,
    });
  }
}

export class EmailPreprocessorError extends EmailSendError {
  constructor(message?: string, input?: IBaseException & { details?: JsonUObject }) {
    super(message ?? 'Email Preprocessor Error', {
      code: 'email-preprocessor-error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...input,
      details: input?.details,
    });
  }
}
