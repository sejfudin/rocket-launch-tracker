import { Body, Delete, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';
import {
  QueueJobCreateRequest,
  QueueJobPaginationQueryDto,
  QueueJobResponse,
  QueueProcessorPaginationQueryDto,
  QueueProcessorResponse,
} from '~common/queues/models';

import { AdminUserAclCheck } from '~modules/admin/admins/auth';
import { AdminController } from '~modules/admin/common';
import { LabelQueryDto, LabelResponse } from '~modules/admin/common/models';

import { QueueAdminService } from './queue-admin.service';

@ApiTags('Queue Admin')
@AdminController('queues')
export class QueueAdminController {
  constructor(private readonly queueAdminService: QueueAdminService) {}

  /**
   * List jobs
   */
  @Get('jobs')
  @AdminUserAclCheck('queue:read')
  @ApiPaginationResponse(QueueJobResponse)
  async paginateJobs(@Query() query: QueueJobPaginationQueryDto): Promise<PaginationDto<QueueJobResponse>> {
    const jobs = await this.queueAdminService.paginateJobs(query);
    return PaginationDto.fromDomain(jobs, QueueJobResponse.fromDomain);
  }

  /**
   * Get a job
   */
  @Get('jobs/:id')
  @AdminUserAclCheck('queue:read')
  async getJob(@Param('id') id: string): Promise<QueueJobResponse> {
    const job = await this.queueAdminService.findJob(id);
    return QueueJobResponse.fromDomain(job);
  }

  /**
   * Cancel a job
   */
  @Delete('jobs/:id')
  @AdminUserAclCheck('queue:delete')
  @HttpCode(204)
  async cancelJob(@Param('id') id: string): Promise<void> {
    await this.queueAdminService.cancelJob({ id });
  }

  /**
   * Get processor names for dropdowns/selects
   */
  @Get('labels')
  @AdminUserAclCheck('queue:read')
  async listLabels(@Query() query: LabelQueryDto): Promise<LabelResponse[]> {
    const labels = await this.queueAdminService.listLabels(query);
    return labels.map(LabelResponse.fromDomain);
  }

  /**
   * List processors and their cron jobs
   */
  @Get('processors')
  @AdminUserAclCheck('queue:read')
  @ApiPaginationResponse(QueueProcessorResponse)
  async paginateProcessors(
    @Query() query: QueueProcessorPaginationQueryDto,
  ): Promise<PaginationDto<QueueProcessorResponse>> {
    const processors = await this.queueAdminService.paginateProcessors(query);
    return PaginationDto.fromDomain(processors, QueueProcessorResponse.fromDomain);
  }

  /**
   * Create a new job based on a processor
   */
  @Post('jobs')
  @AdminUserAclCheck('queue:create')
  async createJob(@Body() data: QueueJobCreateRequest): Promise<QueueJobResponse> {
    const job = await this.queueAdminService.createJob(data.toDomain());
    return QueueJobResponse.fromDomain(job);
  }
}
