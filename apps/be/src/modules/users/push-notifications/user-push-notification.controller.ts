import {
  Body,
  Controller,
  Delete,
  Get,
  ModuleMetadata,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthnIdentity, type IAuthnIdentity } from '~common/authn';
import { StatusResponseDto } from '~common/http/dtos';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import { PushNotificationTokenService } from '~common/push-notifications';
import {
  PushNotificationTokenCreateRequest,
  PushNotificationTokenPaginationQueryDto,
  PushNotificationTokenResponse,
} from '~common/push-notifications/models';

import { UserCheck } from '~modules/users/auth';
import { USER_REST_PREFIX } from '~modules/users/user/user.constants';
import { UserService } from '~modules/users/user/user.service';

@ApiTags('Push Notifications')
@Controller(`${USER_REST_PREFIX}/push-tokens`)
@UserCheck()
export class UserPushNotificationController {
  constructor(
    private readonly pushNotificationTokenService: PushNotificationTokenService,
    private readonly userService: UserService,
  ) {}

  /**
   * Register/update a new device for push notifications
   */
  @Post()
  async register(
    @AuthnIdentity() auth: IAuthnIdentity,
    @Body() data: PushNotificationTokenCreateRequest,
  ): Promise<StatusResponseDto> {
    const user = await this.userService.find({ id: auth.userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.pushNotificationTokenService.registerToken(
      {
        resourceName: auth.userId,
        token: data.token,
        module: 'user',
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
  controllers: [UserPushNotificationController],
};
