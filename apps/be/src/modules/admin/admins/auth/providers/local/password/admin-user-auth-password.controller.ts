import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthnIdentity, IAuthnIdentity } from '~common/authn';
import { AuthnTokenResponse } from '~common/authn/tokens';

import {
  ADMIN_USER_AUTH_API_TAG,
  ADMIN_USER_AUTH_REST_PREFIX,
  AuthenticatedAdminUser,
} from '~modules/admin/admins/auth';
import { AdminUserAuthPasswordLoginRequest } from '~modules/admin/admins/auth/providers/local/password/models/admin-user-auth-password-login.request';

import { AdminUserAuthJwtService } from '../../jwt/admin-user-auth-jwt.service';
import { UserPasswordGuard } from './admin-user-auth-password.guards';
import { AdminUserAuthPasswordService } from './admin-user-auth-password.service';
import { AdminUserAuthPasswordChangeRequest } from './models/admin-user-auth-password-change.request';

@ApiTags(ADMIN_USER_AUTH_API_TAG)
@Controller(ADMIN_USER_AUTH_REST_PREFIX)
export class AdminUserAuthLocalPasswordController {
  constructor(
    private readonly adminUserAuthPasswordService: AdminUserAuthPasswordService,
    private readonly adminUserAuthJwtService: AdminUserAuthJwtService,
  ) {}

  /**
   * Login with username and password
   */
  @HttpCode(200)
  @UserPasswordGuard()
  @ApiBody({ type: AdminUserAuthPasswordLoginRequest })
  @Post('login')
  async login(@Req() req: Request) {
    const tokens = this.adminUserAuthJwtService.sign(req.user!);
    return AuthnTokenResponse.fromDomain(tokens);
  }

  /**
   * Change the password
   */
  @HttpCode(204)
  @AuthenticatedAdminUser()
  @Post('password')
  async password(
    @Body() body: AdminUserAuthPasswordChangeRequest,
    @AuthnIdentity() auth: IAuthnIdentity,
  ): Promise<void> {
    /**
     *  - any logged-in user can change the password
     *  - forgotten passwords should be handled by the magic-link flow
     */
    await this.adminUserAuthPasswordService.changePassword({ id: auth.id }, body);
  }
}
