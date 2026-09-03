import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnException } from '~common/authn';
import { AuthnTokenRequest, AuthnTokenResponse } from '~common/authn/tokens';

import { ADMIN_USER_AUTH_API_TAG, ADMIN_USER_AUTH_REST_PREFIX } from '~modules/admin/admins/auth';

import { AdminUserAuthConfig } from '../../admin-user-auth.config';
import { AdminUserAuthJwtService } from './admin-user-auth-jwt.service';

@ApiTags(ADMIN_USER_AUTH_API_TAG)
@Controller(ADMIN_USER_AUTH_REST_PREFIX)
export class AdminUserAuthJwtController {
  constructor(
    private readonly userAuthConfig: AdminUserAuthConfig,
    private readonly userAuthJwtService: AdminUserAuthJwtService,
  ) {}

  /**
   * Get a new access token
   */
  @HttpCode(200)
  @Post('refresh')
  async accessToken(@Body() data: AuthnTokenRequest): Promise<AuthnTokenResponse> {
    if (!this.userAuthConfig.refreshToken) {
      throw new AuthnException('Refresh token is disabled', { code: 'refresh-token-disabled' });
    }

    return AuthnTokenResponse.fromDomain(this.userAuthJwtService.refresh(data.refreshToken));
  }
}
