import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { CoreConfig } from '~common/core';
import { BadRequestException } from '~common/exceptions';

import { ADMIN_USER_REST_PREFIX } from '~modules/admin/admins';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';

import { AdminUserAuthEmailService } from '../email/admin-user-auth-email.service';
import { AdminUserAuthPasswordService } from '../password/admin-user-auth-password.service';
import { AdminUserAuthPasswordChangeRequest } from '../password/models/admin-user-auth-password-change.request';
import { AdminUserAuthForgotPasswordRequestTemplate } from './admin-user-auth-forgot-password.email-templates';

@Injectable()
export class AdminUserAuthForgotPasswordService {
  constructor(
    private readonly adminUserAuthEmailService: AdminUserAuthEmailService,
    private readonly coreConfig: CoreConfig,
    private readonly adminUserAuthConfig: AdminUserAuthConfig,
    private readonly adminUserAuthPasswordService: AdminUserAuthPasswordService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    let url = this.adminUserAuthConfig.callbackUrl ?? `/api/${ADMIN_USER_REST_PREFIX}/auth/forgot-password/callback`;
    if (url.startsWith('/')) {
      url = this.coreConfig.apiBaseUrl + url;
    }

    await this.adminUserAuthEmailService.sendNonce(email, {
      type: 'reset',
      template: AdminUserAuthForgotPasswordRequestTemplate.name,
      callback: url,
      expiresIn: this.adminUserAuthConfig.nonceExpiration,
    });
  }

  async consumePasswordReset(code: string, data: AdminUserAuthPasswordChangeRequest, req: Request): Promise<void> {
    const { authnIdentity } = await this.adminUserAuthEmailService.consumeNonce(
      code,
      { remoteIp: req.clientIp || 'unknown', userAgent: req.get('User-Agent') || 'unknown' },
      { type: 'reset' },
    );

    if (!authnIdentity) {
      throw new BadRequestException('Authn identity does not exist', 'authn-identity-does-not-exist');
    }

    await this.adminUserAuthPasswordService.changePassword({ id: authnIdentity.id }, data);
  }
}
