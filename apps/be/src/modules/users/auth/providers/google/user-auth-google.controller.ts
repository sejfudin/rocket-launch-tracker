import { Controller, Get, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { IAuthnRequestUser } from '~common/authn';
import { AuthnTokenResponse } from '~common/authn/tokens';
import { BaseException } from '~common/exceptions';
import { LoggerService } from '~common/logger';

import { UserAuthJwtService } from '../../providers/jwt/user-auth-jwt.service';
import { UserAuthConfig } from '../../user-auth.config';
import { USER_AUTH_API_TAG, USER_AUTH_REST_PREFIX } from '../../user-auth.constants';
import { UserAuthService } from '../../user-auth.service';
import { UserAuthGoogleGuard } from './user-auth-google.guard';
import { UserAuthGoogleService } from './user-auth-google.service';

@ApiTags(USER_AUTH_API_TAG)
@Controller(`${USER_AUTH_REST_PREFIX}/google`)
export class UserAuthGoogleController {
  constructor(
    private readonly userAuthConfig: UserAuthConfig,
    private readonly userAuthGoogleService: UserAuthGoogleService,
    private readonly userAuthJwtService: UserAuthJwtService,
    private readonly userAuthService: UserAuthService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Redirect to Google for authentication
   */
  @UseGuards(UserAuthGoogleGuard)
  @HttpCode(204)
  @Get()
  async auth() {}

  /**
   * Handle Google authentication callback and return tokens
   */
  @UseGuards(UserAuthGoogleGuard)
  @Get('callback')
  async login(@Res({ passthrough: true }) res: Response, @Req() req: Request & { user: IAuthnRequestUser }) {
    const shouldRedirect = req.get('Accept')?.includes('text/html') && this.userAuthConfig.redirectUrl;
    try {
      const { authnIdentity } = await this.userAuthGoogleService.login(req.user);
      const tokens = this.userAuthJwtService.sign(authnIdentity);

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
