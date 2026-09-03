import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { StatusResponseDto } from '~common/http/dtos';

import { ADMIN_USER_AUTH_API_TAG, ADMIN_USER_AUTH_REST_PREFIX } from '~modules/admin/admins/auth';

import { AdminUserAuthEmailGenerateRequest } from '../email/models/admin-user-auth-email-generate.request';
import { AdminUserAuthForgotPasswordService } from './admin-user-auth-forgot-password.service';
import { AdminUserAuthForgotPasswordConsumeRequest } from './models/admin-user-auth-forgot-password-consume.request';

@ApiTags(ADMIN_USER_AUTH_API_TAG)
@Controller(`${ADMIN_USER_AUTH_REST_PREFIX}/forgot-password`)
export class AdminUserAuthForgotPasswordController {
  constructor(private readonly adminUserAuthForgotPasswordService: AdminUserAuthForgotPasswordService) {}

  /**
   * Initiate the forgot password process
   */
  @Post()
  @HttpCode(200)
  async request(@Body() data: AdminUserAuthEmailGenerateRequest): Promise<StatusResponseDto> {
    await this.adminUserAuthForgotPasswordService.requestPasswordReset(data.email);

    return StatusResponseDto.fromDomain({
      code: 'forgot-password-requested',
      message: "If you entered a valid email, you'll receive an email shortly",
    });
  }

  /**
   * Change the user's password using the emailed code
   */
  @Post('callback')
  @HttpCode(200)
  async consume(
    @Body() body: AdminUserAuthForgotPasswordConsumeRequest,
    @Req() req: Request,
  ): Promise<StatusResponseDto> {
    const { code, ...data } = body;

    await this.adminUserAuthForgotPasswordService.consumePasswordReset(code, data, req);

    return StatusResponseDto.fromDomain({
      code: 'password-changed',
      message: 'Password was changed successfully',
    });
  }
}
