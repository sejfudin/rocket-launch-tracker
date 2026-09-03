import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthnTokenResponse } from '~common/authn/tokens';
import { BaseException } from '~common/exceptions';
import { StatusResponseDto } from '~common/http/dtos';
import { LoggerService } from '~common/logger';

import { AdminUserAuthConfig } from '../../../admin-user-auth.config';
import { ADMIN_USER_AUTH_API_TAG, ADMIN_USER_AUTH_REST_PREFIX } from '../../../admin-user-auth.constants';
import { AdminUserAuthService } from '../../../admin-user-auth.service';
import { AdminUserAuthEmailGenerateRequest } from '../email/models/admin-user-auth-email-generate.request';
import { AdminUserAuthMagicLinkService } from './admin-user-auth-magic-link.service';

@ApiTags(ADMIN_USER_AUTH_API_TAG)
@Controller(`${ADMIN_USER_AUTH_REST_PREFIX}/magic-link`)
export class AdminUserAuthMagicLinkController {
  constructor(
    private readonly adminUserAuthMagicLinkService: AdminUserAuthMagicLinkService,
    private readonly adminUserAuthConfig: AdminUserAuthConfig,
    private readonly adminUserAuthService: AdminUserAuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Request a new magic link
   */
  @Get()
  async generate(@Query() data: AdminUserAuthEmailGenerateRequest): Promise<StatusResponseDto> {
    await this.adminUserAuthMagicLinkService.generateMagicLink(data.email);
    return StatusResponseDto.fromDomain({ message: "If you entered a valid email, you'll receive an email shortly" });
  }

  /**
   * Magic link callback
   *  when a user clicks the link in an email
   *  or the frontend makes a request
   */
  @Get('callback')
  @ApiResponse({ status: 200, description: 'Magic link callback', type: AuthnTokenResponse })
  @ApiResponse({ status: 302, description: 'Magic link redirect' })
  async consume(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<AuthnTokenResponse | void> {
    const shouldRedirect = req.get('Accept')?.includes('text/html') && this.adminUserAuthConfig.redirectUrl;

    try {
      const { tokens } = await this.adminUserAuthMagicLinkService.consumeMagicLink(code, req);

      if (shouldRedirect) {
        const redirectUrl = this.adminUserAuthService.buildRedirectUrl({
          type: 'login',
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        res.status(HttpStatus.FOUND).redirect(redirectUrl);
        return;
      }

      res.status(HttpStatus.OK);
      return AuthnTokenResponse.fromDomain(tokens);
    } catch (error) {
      if (shouldRedirect && error instanceof BaseException) {
        res.status(HttpStatus.FOUND).redirect(
          this.adminUserAuthService.buildRedirectUrl({
            type: 'error',
            code: error.code,
            message: error.message,
          }),
        );
        this.logger.error(error);
        return;
      }
      throw error;
    }
  }
}
