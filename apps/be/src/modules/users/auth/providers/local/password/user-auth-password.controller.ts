import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthnIdentity, IAuthnIdentity } from '~common/authn';
import { AuthnTokenResponse } from '~common/authn/tokens';

import { USER_AUTH_API_TAG, USER_AUTH_REST_PREFIX, UserCheck } from '~modules/users/auth';
import { UserAuthPasswordLoginRequest } from '~modules/users/auth/providers/local/password/models/user-auth-password-login.request';

import { UserAuthJwtService } from '../../jwt/user-auth-jwt.service';
import { UserAuthPasswordChangeRequest } from './models/user-auth-password-change.request';
import { UserAuthPasswordRegisterRequest } from './models/user-auth-password-register.request';
import { UserPasswordGuard } from './user-auth-password.guards';
import { UserAuthPasswordService } from './user-auth-password.service';

@ApiTags(USER_AUTH_API_TAG)
@Controller(USER_AUTH_REST_PREFIX)
export class UserAuthLocalPasswordController {
  constructor(
    private readonly userAuthPasswordService: UserAuthPasswordService,
    private readonly userAuthJwtService: UserAuthJwtService,
  ) {}

  /**
   * Register a new local user with email/password
   *  and return auth tokens
   */
  @Post('register')
  async register(@Body() data: UserAuthPasswordRegisterRequest): Promise<AuthnTokenResponse> {
    const { authnIdentity } = await this.userAuthPasswordService.register(data);
    const tokens = this.userAuthJwtService.sign(authnIdentity);
    return AuthnTokenResponse.fromDomain(tokens);
  }

  /**
   * Login with username and password
   */
  @HttpCode(200)
  @UserPasswordGuard()
  @ApiBody({ type: UserAuthPasswordLoginRequest })
  @Post('login')
  async login(@Req() req: Request) {
    const tokens = this.userAuthJwtService.sign(req.user!);
    return AuthnTokenResponse.fromDomain(tokens);
  }

  /**
   * Change the password
   */
  @HttpCode(204)
  @UserCheck()
  @Post('password')
  async password(@Body() body: UserAuthPasswordChangeRequest, @AuthnIdentity() auth: IAuthnIdentity): Promise<void> {
    /**
     *  - any logged-in user can change the password
     *  - forgotten passwords should be handled by the magic-link flow
     */
    await this.userAuthPasswordService.changePassword({ id: auth.id }, body);
  }
}
