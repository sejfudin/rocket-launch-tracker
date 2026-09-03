import { HttpStatus, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import { AuthnException, IAuthnIdentity, IAuthnNonce } from '~common/authn';
import { AuthnNonceService } from '~common/authn/nonce';
import { EmailService } from '~common/email';
import type { JsonObject } from '~common/types';

import { ADMIN_USER_AUTHN_KEY } from '~modules/admin/admins/auth';
import { ADMIN_USER_AUTHN_LOCAL_PROVIDER } from '~modules/admin/admins/auth/providers/local/admin-user-auth-local.constants';

@Injectable()
export class AdminUserAuthEmailService {
  constructor(
    private readonly authnNonceService: AuthnNonceService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate and send a new magic-link nonce via email
   */
  async sendNonce(
    email: string,
    options: {
      type: string;
      template: string;
      callback: string;
      expiresIn?: number;
      allowDisabled?: boolean;
    },
  ): Promise<void> {
    const { code, authnIdentity, expiresAt } = await this.authnNonceService.generate(
      {
        providerId: email,
        provider: ADMIN_USER_AUTHN_LOCAL_PROVIDER,
        namespace: ADMIN_USER_AUTHN_KEY,
      },
      {
        type: options.type,
        expiresIn: options.expiresIn || 60 * 30,
      },
    );

    if (!options.allowDisabled && authnIdentity.disabledAt) {
      throw new AuthnException('Identity is disabled', {
        code: 'identity-disabled',
        httpStatus: HttpStatus.BAD_REQUEST,
      });
    }

    const url = `${options.callback}?type=${options.type}&code=${code}`;

    await this.emailService.sendTemplate({ to: authnIdentity.providerId }, options.template, {
      url,
      expiresIn: expiresAt ? DateTime.fromJSDate(expiresAt).toRelative({ unit: 'minutes', locale: 'en' }) : null,
    });
  }

  async consumeNonce(
    code: string,
    usedData: JsonObject,
    options: { type: string },
  ): Promise<{ authnIdentity: IAuthnIdentity; nonce: IAuthnNonce }> {
    const { authnIdentity, nonce } = await this.authnNonceService.consume({ code, type: options.type }, { usedData });

    if (authnIdentity.disabledAt) {
      throw new AuthnException('Identity is disabled', { code: 'identity-disabled' });
    }

    return {
      authnIdentity,
      nonce,
    };
  }
}
