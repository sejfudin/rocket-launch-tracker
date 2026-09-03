import { HttpStatus } from '@nestjs/common';

import type { IErrorResponse } from '~common/exceptions';
import { BaseException, type IBaseException } from '~common/exceptions/base.exception';

export class QueueError extends BaseException {
  constructor(message?: string, input?: IBaseException & { job?: any }) {
    super(message ?? 'Queue Execution Error', {
      code: 'queue-execution-error',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...input,
    });

    this.job = input?.job ?? {};
  }

  public readonly job: any;

  toPublic(): IErrorResponse {
    return {
      status: 'error',
      code: this.code,
      message: this.message,
      job: { id: this.job?.id, processor: this.job?.processor },
    } as IErrorResponse;
  }
}
