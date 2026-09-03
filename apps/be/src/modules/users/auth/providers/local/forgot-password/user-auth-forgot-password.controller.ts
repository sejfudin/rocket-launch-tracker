import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { StatusResponseDto } from '~common/http/dtos';

import { USER_AUTH_API_TAG, USER_AUTH_REST_PREFIX } from '../../../user-auth.constants';
import { UserAuthEmailGenerateRequest } from '../email/models/user-auth-email-generate.request';
import { UserAuthForgotPasswordConsumeRequest } from './models/user-auth-forgot-password-consume.request';
import { UserAuthForgotPasswordService } from './user-auth-forgot-password.service';

@ApiTags(USER_AUTH_API_TAG)
@Controller(`${USER_AUTH_REST_PREFIX}/forgot-password`)
export class UserAuthForgotPasswordController {
  constructor(private readonly userAuthForgotPasswordService: UserAuthForgotPasswordService) {}

  /**
   * Initiate the forgot password process
   */
  @Post()
  @HttpCode(200)
  async request(@Body() data: UserAuthEmailGenerateRequest): Promise<StatusResponseDto> {
    await this.userAuthForgotPasswordService.requestPasswordReset(data.email);

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
  async consume(@Body() body: UserAuthForgotPasswordConsumeRequest, @Req() req: Request): Promise<StatusResponseDto> {
    const { code, ...data } = body;

    await this.userAuthForgotPasswordService.consumePasswordReset(code, data, req);

    return StatusResponseDto.fromDomain({
      code: 'password-changed',
      message: 'Password was changed successfully',
    });
  }
}
