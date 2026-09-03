import { Controller, Get, HttpStatus, Query, Req, Res } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthnTokenResponse } from '~common/authn/tokens';
import { BaseException } from '~common/exceptions';
import { StatusResponseDto } from '~common/http/dtos';
import { LoggerService } from '~common/logger';

import { USER_AUTH_API_TAG, USER_AUTH_REST_PREFIX } from '~modules/users/auth';
import { UserAuthConfig } from '~modules/users/auth/user-auth.config';
import { UserAuthService } from '~modules/users/auth/user-auth.service';

import { UserAuthEmailGenerateRequest } from '../email/models/user-auth-email-generate.request';
import { UserAuthMagicLinkService } from './user-auth-magic-link.service';

@ApiTags(USER_AUTH_API_TAG)
@Controller(`${USER_AUTH_REST_PREFIX}/magic-link`)
export class UserAuthMagicLinkController {
  constructor(
    private readonly userAuthMagicLinkService: UserAuthMagicLinkService,
    private readonly userAuthConfig: UserAuthConfig,
    private readonly userAuthService: UserAuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Request a new magic link
   */
  @Get()
  async generate(@Query() data: UserAuthEmailGenerateRequest): Promise<StatusResponseDto> {
    await this.userAuthMagicLinkService.generateMagicLink(data.email);
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
    const shouldRedirect = req.get('Accept')?.includes('text/html') && this.userAuthConfig.redirectUrl;
    try {
      const { tokens } = await this.userAuthMagicLinkService.consumeMagicLink(code, req);

      if (shouldRedirect) {
        const redirectUrl = this.userAuthService.buildRedirectUrl({
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
          this.userAuthService.buildRedirectUrl({
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
