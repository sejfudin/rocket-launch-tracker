import { Injectable } from '@nestjs/common';
import { Request } from 'express';

import { IAuthnIdentity, IAuthnToken } from '~common/authn';
import { CoreConfig } from '~common/core';

import { USER_REST_PREFIX } from '~modules/users/user/user.constants';

import { UserAuthConfig } from '../../../user-auth.config';
import { UserAuthJwtService } from '../../jwt/user-auth-jwt.service';
import { UserAuthEmailService } from '../email/user-auth-email.service';
import { UserAuthMagicLinkRequestEmailTemplate } from './user-auth-magic-link.email-templates';

@Injectable()
export class UserAuthMagicLinkService {
  constructor(
    private readonly userAuthEmailService: UserAuthEmailService,
    private readonly coreConfig: CoreConfig,
    private readonly userAuthConfig: UserAuthConfig,
    private readonly userAuthJwtService: UserAuthJwtService,
  ) {}

  async generateMagicLink(email: string): Promise<void> {
    let url = this.userAuthConfig.callbackUrl ?? `/api/${USER_REST_PREFIX}/auth/magic-link/callback`;
    if (url.startsWith('/')) {
      url = this.coreConfig.apiBaseUrl + url;
    }

    await this.userAuthEmailService.sendNonce(email, {
      type: 'magic',
      template: UserAuthMagicLinkRequestEmailTemplate.name,
      callback: url,
      expiresIn: this.userAuthConfig.nonceExpiration,
    });
  }

  async consumeMagicLink(code: string, req: Request): Promise<{ authnIdentity: IAuthnIdentity; tokens: IAuthnToken }> {
    const { authnIdentity } = await this.userAuthEmailService.consumeNonce(
      code,
      { remoteIp: req.clientIp || 'unknown', userAgent: req.get('User-Agent') || 'unknown' },
      { type: 'magic' },
    );

    const tokens = this.userAuthJwtService.sign(authnIdentity);

    return {
      authnIdentity,
      tokens,
    };
  }
}
