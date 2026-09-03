import { Body, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

import { getConfig } from '~common/config';
import { NotFoundException } from '~common/exceptions';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminConfig } from '~modules/admin/admins/admin.config';
import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminUserAuthPasswordRegisterRequest } from '~modules/admin/admins/auth/providers/local/password/models/admin-user-auth-password-register.request';
import { AdminController } from '~modules/admin/common';

import { ADMIN_USER_API_TAG, ADMIN_USER_REST_PREFIX } from '../admin.constants';
import { AdminUserService } from '../user/admin-user.service';
import { AdminUserPaginationQueryDto } from '../user/dtos/admin-user.pagination-query.dto';
import { AdminUserResponse } from '../user/models/admin-user.response';
import { AdminUserUpdateRequest } from '../user/models/admin-user-update.request';
import { AdminUserAdminService } from './admin-user.admin.service';
import { AdminUserAdminBulkDeleteRequest } from './dto/admin-user-admin-bulk-delete.request';
import { AdminUserAuthPasswordAndSecretRegisterRequest } from './models/admin-user-password-and-secret-register.request';

const adminConfig = getConfig(AdminConfig);

@ApiTags(`${ADMIN_USER_API_TAG} Admin`)
@AdminController(ADMIN_USER_REST_PREFIX)
export class AdminUserAdminController {
  constructor(
    private readonly adminUserAdminService: AdminUserAdminService,
    private readonly adminUserService: AdminUserService,
  ) {}

  /**
   * List adminUsers
   */
  @Get()
  @AdminUserAclCheck('adminUser:read')
  @ApiPaginationResponse(AdminUserResponse)
  async paginate(@Query() query: AdminUserPaginationQueryDto): Promise<PaginationDto<AdminUserResponse>> {
    const adminUsers = await this.adminUserService.paginate(query);
    return PaginationDto.fromDomain(adminUsers, AdminUserResponse.fromDomain);
  }

  /**
   * Get adminUser
   */
  @Get(':id')
  @AdminUserAclCheck('adminUser:read')
  async get(@Param('id') id: string): Promise<AdminUserResponse> {
    const user = await this.adminUserService.find({ id });
    if (!user) {
      throw new NotFoundException('AdminUser not found');
    }
    return AdminUserResponse.fromDomain(user);
  }

  /**
   * Create new adminUser
   */
  @Post()
  @AdminUserAclCheck('adminUser:create')
  async createWithPassword(@Body() data: AdminUserAuthPasswordRegisterRequest): Promise<AdminUserResponse> {
    const { adminUser } = await this.adminUserAdminService.createWithPassword(data);
    return AdminUserResponse.fromDomain(adminUser);
  }

  /**
   * Create new adminUser with Password and Secret
   */
  @ApiExcludeEndpoint(!adminConfig.createSecret)
  @Post('create-with-secret')
  async createWithSecret(@Body() data: AdminUserAuthPasswordAndSecretRegisterRequest): Promise<AdminUserResponse> {
    const { adminUser } = await this.adminUserAdminService.createWithPasswordAndSecret(data);
    return AdminUserResponse.fromDomain(adminUser);
  }

  /**
   * Bulk delete adminUsers
   */
  @Post('bulk-delete')
  @AdminUserAclCheck('adminUser:delete')
  @HttpCode(204)
  async bulkDelete(@Body() data: AdminUserAdminBulkDeleteRequest): Promise<void> {
    await this.adminUserAdminService.bulkDelete(data);
  }

  /**
   * Update adminUser
   * @param data
   * @param id
   */
  @Put(':id')
  @AdminUserAclCheck('adminUser:update')
  async update(@Body() data: AdminUserUpdateRequest, @Param('id') id: string): Promise<AdminUserResponse> {
    const adminUser = await this.adminUserService.update({ id }, data);
    return AdminUserResponse.fromDomain(adminUser);
  }

  /**
   * Delete adminUser and authentications
   */
  @Delete(':id')
  @AdminUserAclCheck('adminUser:delete')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.adminUserAdminService.delete({ userId: id });
  }
}
