import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { CoreConfig } from '~common/core';
import { InternalServerErrorException } from '~common/exceptions';

import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { USER_REST_PREFIX } from '~modules/users/user/user.constants';

import { UserAuthEmailService } from '../email/user-auth-email.service';
import { UserAuthPasswordChangeRequest } from '../password/models/user-auth-password-change.request';
import { UserAuthPasswordService } from '../password/user-auth-password.service';
import { UserAuthForgotPasswordRequestTemplate } from './user-auth-forgot-password.email-templates';

@Injectable()
export class UserAuthForgotPasswordService {
  constructor(
    private readonly userAuthEmailService: UserAuthEmailService,
    private readonly coreConfig: CoreConfig,
    private readonly userAuthConfig: UserAuthConfig,
    private readonly userAuthPasswordService: UserAuthPasswordService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    // this email needs to go to the frontend url for the user to enter a new password

    if (!this.userAuthConfig.redirectUrl) {
      throw new InternalServerErrorException('Redirect URL is not set');
    }

    await this.userAuthEmailService.sendNonce(email, {
      type: 'reset',
      template: UserAuthForgotPasswordRequestTemplate.name,
      callback: this.userAuthConfig.redirectUrl,
      expiresIn: this.userAuthConfig.nonceExpiration,
    });
  }

  async consumePasswordReset(code: string, data: UserAuthPasswordChangeRequest, req: Request): Promise<void> {
    const { authnIdentity } = await this.userAuthEmailService.consumeNonce(
      code,
      { remoteIp: req.clientIp || 'unknown', userAgent: req.get('User-Agent') || 'unknown' },
      { type: 'reset' },
    );

    await this.userAuthPasswordService.changePassword({ id: authnIdentity.id }, data);
  }
}
