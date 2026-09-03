import { Body, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { RocketModelPaginationQueryDto } from '~modules/rocket/models/rocket-model.pagination.request';
import { RocketService } from '~modules/rocket/rocket.service';

import { RocketModelAdminResponse } from './models/rocket-model-admin.response';
import { RocketModelAdminCreateRequest } from './models/rocket-model-admin-create.request';
import { RocketModelAdminUpdateRequest } from './models/rocket-model-admin-update.request';

const ROCKET_MODEL_ADMIN_API_TAG = 'Rocket Model';

@ApiTags(`${ROCKET_MODEL_ADMIN_API_TAG} Admin`)
@AdminController('rocket-models')
export class RocketModelAdminController {
  constructor(private readonly rocketService: RocketService) {}

  /**
   * List rocket models
   */
  @Get()
  @AdminUserAclCheck('rocket-model:read')
  @ApiPaginationResponse(RocketModelAdminResponse)
  async paginate(@Query() query: RocketModelPaginationQueryDto): Promise<PaginationDto<RocketModelAdminResponse>> {
    const models = await this.rocketService.paginateModels(query);
    return PaginationDto.fromDomain(models, RocketModelAdminResponse.fromDomain);
  }

  /**
   * Get rocket model
   */
  @Get(':id')
  @AdminUserAclCheck('rocket-model:read')
  async get(@Param('id') id: string): Promise<RocketModelAdminResponse> {
    const model = await this.rocketService.findModel({ id });
    return RocketModelAdminResponse.fromDomain(model);
  }

  /**
   * Create rocket model
   */
  @Post()
  @AdminUserAclCheck('rocket-model:create')
  async create(@Body() data: RocketModelAdminCreateRequest): Promise<RocketModelAdminResponse> {
    const model = await this.rocketService.createModel({
      name: data.name,
      organization: data.organization,
    });
    return RocketModelAdminResponse.fromDomain(model);
  }

  /**
   * Update rocket model
   */
  @Put(':id')
  @AdminUserAclCheck('rocket-model:update')
  async update(
    @Param('id') id: string,
    @Body() data: RocketModelAdminUpdateRequest,
  ): Promise<RocketModelAdminResponse> {
    const model = await this.rocketService.updateModel({ id }, data);
    return RocketModelAdminResponse.fromDomain(model);
  }

  /**
   * Delete rocket model
   */
  @Delete(':id')
  @AdminUserAclCheck('rocket-model:delete')
  @ApiResponse({ status: 204, description: 'Rocket model deleted' })
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.rocketService.deleteModel({ id });
  }
}
