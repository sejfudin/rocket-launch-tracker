import { Body, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { NotFoundException } from '~common/exceptions';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelResponse } from '~modules/admin/common/models';
import { UserAuthPasswordRegisterRequest } from '~modules/users/auth/providers/local/password/models/user-auth-password-register.request';
import { UserAuthPasswordService } from '~modules/users/auth/providers/local/password/user-auth-password.service';
import { UserAuthService } from '~modules/users/auth/user-auth.service';
import { UserLabelsRequest } from '~modules/users/user/models/user-labels.request';
import { UserPaginationQueryDto } from '~modules/users/user/models/user-pagination.request';
import { UserService } from '~modules/users/user/user.service';

import { UserAdminResponse } from './models/user-admin.response';
import { UserAdminBulkDeleteRequest } from './models/user-admin-bulk-delete.request';
import { UserAdminUpdateRequest } from './models/user-admin-update.request';
import { USER_ADMIN_API_TAG, USER_ADMIN_REST_PREFIX } from './user-admin.constants';

@ApiTags(`${USER_ADMIN_API_TAG} Admin`)
@AdminController(USER_ADMIN_REST_PREFIX)
export class UserAdminController {
  constructor(
    private readonly userService: UserService,
    private readonly userAuthPasswordService: UserAuthPasswordService,
    private readonly userAuthService: UserAuthService,
  ) {}

  /**
   * Get labels for dropdowns/selects
   */
  @Get('labels')
  @AdminUserAclCheck('user:read')
  async listLabels(@Query() query: UserLabelsRequest): Promise<LabelResponse[]> {
    const labels = await this.userService.listLabels(query);
    return labels.map(LabelResponse.fromDomain);
  }

  /**
   * List users
   */
  @Get()
  @AdminUserAclCheck('user:read')
  @ApiPaginationResponse(UserAdminResponse)
  async paginate(@Query() query: UserPaginationQueryDto): Promise<PaginationDto<UserAdminResponse>> {
    const users = await this.userService.paginate(query);
    return PaginationDto.fromDomain(users, UserAdminResponse.fromDomain);
  }

  /**
   * Get user
   */
  @Get(':id')
  @AdminUserAclCheck('user:read')
  async get(@Param('id') id: string): Promise<UserAdminResponse> {
    const user = await this.userService.find({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserAdminResponse.fromDomain(user);
  }

  /**
   * Create new user
   */
  @Post()
  @AdminUserAclCheck('user:create')
  async createWithPassword(@Body() data: UserAuthPasswordRegisterRequest): Promise<UserAdminResponse> {
    const { user } = await this.userAuthPasswordService.register(data);
    return UserAdminResponse.fromDomain(user);
  }

  /**
   * Bulk delete users
   */
  @Post('bulk-delete')
  @AdminUserAclCheck('user:delete')
  @HttpCode(204)
  async bulkDelete(@Body() data: UserAdminBulkDeleteRequest): Promise<void> {
    await this.userAuthService.bulkDelete(data);
  }

  /**
   * Update user
   * @param data
   * @param id
   */
  @Put(':id')
  @AdminUserAclCheck('user:update')
  async update(@Body() data: UserAdminUpdateRequest, @Param('id') id: string): Promise<UserAdminResponse> {
    const user = await this.userService.update({ id }, data);
    return UserAdminResponse.fromDomain(user);
  }

  /**
   * Delete user and authentications
   */
  @Delete(':id')
  @AdminUserAclCheck('user:delete')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.userAuthService.delete({ userId: id });
  }
}
