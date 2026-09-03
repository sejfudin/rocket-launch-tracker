import { Body, Controller, Delete, Get, ModuleMetadata, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnIdentity, type IAuthnIdentity } from '~common/authn';
import { NotFoundException } from '~common/exceptions';
import { StatusResponseDto } from '~common/http/dtos';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import { PushNotificationTokenService } from '~common/push-notifications';
import {
  PushNotificationTokenCreateRequest,
  PushNotificationTokenPaginationQueryDto,
  PushNotificationTokenResponse,
} from '~common/push-notifications/models';

import { AdminUserService } from '~modules/admin/admins/user';

import { ADMIN_USER_API_TAG, ADMIN_USER_REST_PREFIX } from '../admin.constants';
import { AuthenticatedAdminUser } from '../auth';
@ApiTags(ADMIN_USER_API_TAG)
@Controller(`${ADMIN_USER_REST_PREFIX}/push-tokens`)
@AuthenticatedAdminUser()
export class AdminUserPushNotificationController {
  constructor(
    private readonly pushNotificationTokenService: PushNotificationTokenService,
    private readonly adminUserService: AdminUserService,
  ) {}

  /**
   * Register/update a new device for push notifications
   */
  @Post()
  async register(
    @AuthnIdentity() auth: IAuthnIdentity,
    @Body() data: PushNotificationTokenCreateRequest,
  ): Promise<StatusResponseDto> {
    const user = await this.adminUserService.find({ id: auth.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.pushNotificationTokenService.registerToken(
      {
        resourceName: auth.userId,
        token: data.token,
        module: 'admin-user',
        resourceId: auth.userId,
        resourceLabel: `${user.name} ${user.email}`,
        title: data.title,
      },
      {
        replace: data.replace,
      },
    );
    return StatusResponseDto.fromDomain({ status: 'ok', message: 'Token registered', code: 'token-registered' });
  }

  /**
   * Paginate push notification tokens
   */
  @Get()
  @ApiPaginationResponse(PushNotificationTokenResponse)
  async paginate(
    @AuthnIdentity() auth: IAuthnIdentity,
    @Query() data: PushNotificationTokenPaginationQueryDto,
  ): Promise<PaginationDto<PushNotificationTokenResponse>> {
    const tokens = await this.pushNotificationTokenService.paginateToken(data, {
      resourceName: auth.userId,
    });
    return PaginationDto.fromDomain(tokens, PushNotificationTokenResponse.fromDomain);
  }

  @Delete(':id')
  async remove(
    @AuthnIdentity() auth: IAuthnIdentity,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StatusResponseDto> {
    const num = await this.pushNotificationTokenService.deleteToken({ id, resourceName: auth.userId });
    return StatusResponseDto.fromDomain({ code: 'push-notification-tokens-removed', message: `${num} tokens removed` });
  }
}

export const PushNotificationRestPlugin: ModuleMetadata = {
  controllers: [AdminUserPushNotificationController],
};
