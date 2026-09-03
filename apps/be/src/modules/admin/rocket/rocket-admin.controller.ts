import { Body, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { NotFoundException } from '~common/exceptions';
import { StatusResponseDto } from '~common/http/dtos';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelResponse } from '~modules/admin/common/models';
import { RocketAdminLaunchRequest } from '~modules/admin/rocket/models/rocket-admin-launch.request';
import { RocketLabelsRequest, RocketPaginationQueryDto } from '~modules/rocket/models';
import { RocketService } from '~modules/rocket/rocket.service';

import { RocketAdminResponse } from './models/rocket-admin.response';
import { RocketAdminCreateRequest } from './models/rocket-admin-create.request';
import { RocketAdminUpdateRequest } from './models/rocket-admin-update.request';

const ROCKET_ADMIN_API_TAG = 'Rocket';

@ApiTags(`${ROCKET_ADMIN_API_TAG} Admin`)
@AdminController('rockets')
export class RocketAdminController {
  constructor(private readonly rocketService: RocketService) {}

  /**
   * Get rocket labels for dropdowns/selects
   */
  @Get('labels')
  @AdminUserAclCheck('rocket:read')
  async listLabels(@Query() query: RocketLabelsRequest): Promise<LabelResponse[]> {
    const labels = await this.rocketService.listLabels(query);
    return labels.map(LabelResponse.fromDomain);
  }

  /**
   * List rockets
   */
  @Get()
  @AdminUserAclCheck('rocket:read')
  @ApiPaginationResponse(RocketAdminResponse)
  async paginate(@Query() query: RocketPaginationQueryDto): Promise<PaginationDto<RocketAdminResponse>> {
    const rockets = await this.rocketService.paginate(query);
    return PaginationDto.fromDomain(rockets, RocketAdminResponse.fromDomain);
  }

  /**
   * Get rocket
   */
  @Get(':id')
  @AdminUserAclCheck('rocket:read')
  async get(@Param('id') id: string): Promise<RocketAdminResponse> {
    const rocket = await this.rocketService.find({ id });
    if (!rocket) {
      throw new NotFoundException('Rocket not found');
    }
    return RocketAdminResponse.fromDomain(rocket);
  }

  /**
   * Create rocket
   */
  @Post()
  @AdminUserAclCheck('rocket:create')
  async create(@Body() data: RocketAdminCreateRequest): Promise<RocketAdminResponse> {
    const rocket = await this.rocketService.create({
      name: data.name,
      modelId: data.modelId,
      ownerId: data.ownerId,
    });
    return RocketAdminResponse.fromDomain(rocket);
  }

  /**
   * Update rocket
   */
  @Put(':id')
  @AdminUserAclCheck('rocket:update')
  async update(@Param('id') id: string, @Body() data: RocketAdminUpdateRequest): Promise<RocketAdminResponse> {
    const rocket = await this.rocketService.update({ id }, data);
    return RocketAdminResponse.fromDomain(rocket);
  }

  /**
   * Launch rocket
   */
  @Post(':id/launch')
  @AdminUserAclCheck('rocket:launch')
  async launch(@Param('id') id: string, @Body() data: RocketAdminLaunchRequest): Promise<StatusResponseDto> {
    await this.rocketService.launch({ id }, data);
    return StatusResponseDto.fromDomain({ code: 'launched', message: 'Rocket launched' });
  }

  /**
   * Delete rocket
   */
  @Delete(':id')
  @AdminUserAclCheck('rocket:delete')
  @ApiResponse({ status: 204, description: 'Rocket deleted' })
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.rocketService.delete({ id });
  }
}
