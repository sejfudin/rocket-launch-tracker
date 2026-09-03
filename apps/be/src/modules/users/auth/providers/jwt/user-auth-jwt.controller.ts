import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnException } from '~common/authn';
import { AuthnTokenRequest, AuthnTokenResponse } from '~common/authn/tokens';

import { USER_AUTH_API_TAG, USER_AUTH_REST_PREFIX } from '~modules/users/auth';

import { UserAuthConfig } from '../../user-auth.config';
import { UserAuthJwtService } from './user-auth-jwt.service';

@ApiTags(USER_AUTH_API_TAG)
@Controller(USER_AUTH_REST_PREFIX)
export class UserAuthJwtController {
  constructor(
    private readonly userAuthConfig: UserAuthConfig,
    private readonly userAuthJwtService: UserAuthJwtService,
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
