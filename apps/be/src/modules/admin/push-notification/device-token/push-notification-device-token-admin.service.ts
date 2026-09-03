import { BadRequestException, Injectable } from '@nestjs/common';

import { PaginationDto } from '~common/http/pagination';
import { IPushNotificationTokenPaginationQuery } from '~common/push-notifications/models';
import { PushNotificationTokenService } from '~common/push-notifications/push-notification-token.service';

import { UserService } from '~modules/users/user/user.service';

import { PushNotificationDeviceTokenAdminResponse } from './models/push-notification-device-token-admin.response';

@Injectable()
export class PushNotificationDeviceTokenAdminService {
  constructor(
    private readonly pushNotificationTokenService: PushNotificationTokenService,
    private readonly userService: UserService,
  ) {}

  async paginate(
    query: IPushNotificationTokenPaginationQuery,
  ): Promise<PaginationDto<PushNotificationDeviceTokenAdminResponse>> {
    const paginatedTokens = await this.pushNotificationTokenService.paginateToken(query);

    return PaginationDto.fromDomain(paginatedTokens, (token) =>
      PushNotificationDeviceTokenAdminResponse.fromDomain(token),
    );
  }

  async delete(id: string): Promise<void> {
    const tokens = await this.pushNotificationTokenService.listToken({ where: { id } });
    if (tokens.length === 0) {
      throw new BadRequestException(`Cannot delete token, because token with id: ${id} not found`);
    }
    await this.pushNotificationTokenService.deleteToken({ id });
  }
}
