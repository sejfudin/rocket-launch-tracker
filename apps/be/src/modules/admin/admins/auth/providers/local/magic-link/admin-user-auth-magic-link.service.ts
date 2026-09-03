import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { IAuthnIdentity, IAuthnToken } from '~common/authn';
import { CoreConfig } from '~common/core';

import { ADMIN_USER_REST_PREFIX } from '~modules/admin/admins/admin.constants';
import { AdminUserAuthConfig } from '~modules/admin/admins/auth/admin-user-auth.config';

import { AdminUserAuthJwtService } from '../../jwt/admin-user-auth-jwt.service';
import { AdminUserAuthEmailService } from '../email/admin-user-auth-email.service';
import { AdminUserAuthMagicLinkRequestEmailTemplate } from './admin-user-auth-magic-link.email-templates';

@Injectable()
export class AdminUserAuthMagicLinkService {
  constructor(
    private readonly adminUserAuthEmailService: AdminUserAuthEmailService,
    private readonly coreConfig: CoreConfig,
    private readonly adminUserAuthConfig: AdminUserAuthConfig,
    private readonly adminUserAuthJwtService: AdminUserAuthJwtService,
  ) {}

  async generateMagicLink(email: string): Promise<void> {
    let url = this.adminUserAuthConfig.callbackUrl ?? `/api/${ADMIN_USER_REST_PREFIX}/auth/magic-link/callback`;
    if (url.startsWith('/')) {
      url = this.coreConfig.apiBaseUrl + url;
    }

    await this.adminUserAuthEmailService.sendNonce(email, {
      type: 'magic',
      template: AdminUserAuthMagicLinkRequestEmailTemplate.name,
      callback: url,
      expiresIn: this.adminUserAuthConfig.nonceExpiration,
    });
  }

  async consumeMagicLink(code: string, req: Request): Promise<{ authnIdentity: IAuthnIdentity; tokens: IAuthnToken }> {
    const { authnIdentity } = await this.adminUserAuthEmailService.consumeNonce(
      code,
      { remoteIp: req.clientIp || 'unknown', adminUserAgent: req.get('User-Agent') || 'unknown' },
      { type: 'magic' },
    );

    const tokens = this.adminUserAuthJwtService.sign(authnIdentity);

    return {
      authnIdentity,
      tokens,
    };
  }
}
