import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthnIdentity, IAuthnIdentity } from '~common/authn';
import { StatusResponseDto } from '~common/http/dtos';
import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { RocketLaunchRequest } from '~modules/rocket/models/rocket-launch.request';
import { UserAclCheck } from '~modules/users/auth';

import {
  RocketCreateRequest,
  RocketNextLaunchResponse,
  RocketPaginationQueryDto,
  RocketResponse,
  RocketUpdateRequest,
} from './models';
import { API_ROCKET_LIST_MODELS } from './models/rocket.constants';
import { RocketModelResponse } from './models/rocket-model.response';
import { RocketModelListQueryDto } from './models/rocket-model.types';
import { RocketService } from './rocket.service';

@ApiTags('Rocket')
@Controller('rockets')
export class RocketController {
  constructor(private readonly rocketService: RocketService) {}

  /**
   * Public endpoint to list rockets
   */
  @ApiPaginationResponse(RocketResponse)
  @Get()
  async paginatePublic(@Query() query: RocketPaginationQueryDto): Promise<PaginationDto<RocketResponse>> {
    const rockets = await this.rocketService.paginate(query);
    return PaginationDto.fromDomain(rockets, RocketResponse.fromDomain);
  }

  /**
   * Public endpoint to get the next rocket launch
   */
  @Get('next-launch')
  @ApiResponse({ type: RocketNextLaunchResponse, status: 200 })
  async getNextLaunch(): Promise<RocketNextLaunchResponse> {
    const rocket = await this.rocketService.findNextLaunch();
    return RocketNextLaunchResponse.fromDomain(rocket);
  }

  /**
   * Public endpoint to list rocket models
   */
  @Get('models')
  @ApiOperation({ operationId: API_ROCKET_LIST_MODELS })
  async listModels(@Query() query: RocketModelListQueryDto): Promise<RocketModelResponse[]> {
    return (await this.rocketService.listModels(query)).map(RocketModelResponse.fromDomain);
  }

  /**
   * Get rocket by id (public endpoint)
   */
  @Get(':id')
  async find(@Param('id', ParseUUIDPipe) id: string): Promise<RocketResponse> {
    return RocketResponse.fromDomain(await this.rocketService.find({ id }));
  }

  /**
   * Create a rocket
   */
  @UserAclCheck('rocket:create')
  @Post()
  async create(@Body() data: RocketCreateRequest, @AuthnIdentity() auth: IAuthnIdentity): Promise<RocketResponse> {
    return RocketResponse.fromDomain(
      await this.rocketService.create({
        ...data,
        ownerId: auth.userId,
      }),
    );
  }

  /**
   * Update a rocket
   */
  @UserAclCheck('rocket:update', { ownerId: '$query.ownerId' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: RocketUpdateRequest,
    @Query('ownerId') ownerId?: string,
  ): Promise<RocketResponse> {
    return RocketResponse.fromDomain(await this.rocketService.update({ id, ownerId }, data));
  }

  /**
   * Launch a rocket
   */
  @UserAclCheck('rocket:launch', { ownerId: '$query.ownerId' })
  @Post(':id/launch')
  async launch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: RocketLaunchRequest,
    @Query('ownerId') ownerId?: string,
  ): Promise<StatusResponseDto> {
    await this.rocketService.launch({ id, ownerId }, data);
    return StatusResponseDto.fromDomain({ code: 'launched', message: 'Rocket launched' });
  }

  /**
   * Delete a rocket
   */
  @UserAclCheck('rocket:delete', { ownerId: '$query.ownerId' })
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string, @Query('ownerId') ownerId?: string): Promise<StatusResponseDto> {
    await this.rocketService.delete({ id, ownerId });
    return StatusResponseDto.fromDomain({ code: 'deleted', message: 'Rocket deleted' });
  }
}
