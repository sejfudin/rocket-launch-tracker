import { HttpStatus } from '@nestjs/common';

import { BaseException, type IBaseException } from '~common/exceptions/base.exception';
import type { JsonUObject } from '~common/types';

export class AuthnException extends BaseException {
  public details: JsonUObject | undefined;

  constructor(message?: string, input?: IBaseException & { details?: JsonUObject }) {
    super(message ?? 'Authn Exception', {
      code: 'authn-exception',
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      ...input,
    });

    this.details = input?.details;
  }
}
