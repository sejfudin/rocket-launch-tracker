import { Injectable } from '@nestjs/common';

import { BadRequestException, NotFoundException } from '~common/exceptions';
import { IPagination } from '~common/http/pagination';
import { IMedia } from '~common/media';
import { QueueService } from '~common/queues';
import { makeUUID } from '~common/utils/short-uuid';

import {
  IRocket,
  IRocketCreate,
  IRocketLabelsRequest,
  IRocketPaginationQuery,
  IRocketUpdate,
  RocketStatusType,
  RocketType,
} from './models';
import { IRocketModelPaginationQuery } from './models/rocket-model.pagination.request';
import {
  IRocketModel,
  IRocketModelCreate,
  IRocketModelListQueryDto,
  IRocketModelUpdate,
} from './models/rocket-model.types';
import { RocketMediaService } from './rocket.media.service';
import { RocketLaunchJobData } from './rocket.queues';
import { RocketRepository } from './rocket.repository';
import { RocketModelRepository } from './rocket-model.repository';

@Injectable()
export class RocketService {
  constructor(
    private readonly rocketRepository: RocketRepository,
    private readonly rocketModelRepository: RocketModelRepository,
    private readonly rocketMediaService: RocketMediaService,
    private readonly queueService: QueueService,
  ) {}

  async paginate(query: IRocketPaginationQuery): Promise<IPagination<IRocket>> {
    const pagination = await this.rocketRepository.paginate(query);
    pagination.items = await this.rocketMediaService.resolveMedia(pagination.items);
    return pagination;
  }

  async find(where: { id: string; ownerId?: string }): Promise<IRocket> {
    let rocket = await this.rocketRepository.find(where);
    if (!rocket) {
      throw new NotFoundException('Rocket not found');
    }
    rocket = await this.rocketMediaService.resolveMedia(rocket);
    return rocket;
  }

  async findNextLaunch(): Promise<IRocket | null> {
    const rocket = await this.rocketRepository.findNextLaunch();
    if (!rocket) {
      return null;
    }
    return await this.rocketMediaService.resolveMedia(rocket);
  }

  async create(data: IRocketCreate): Promise<IRocket> {
    // Legacy model validation
    if (data.modelId) {
      const model = await this.rocketModelRepository.find({ id: data.modelId });
      if (!model) {
        throw new BadRequestException('Model not found');
      }
    }

    // Assignment field validation
    this.validateRocketData(data);

    return await this.rocketRepository.create({
      status: RocketStatusType.Ready,
      ...data,
      id: makeUUID(),
    });
  }

  /**
   * Validates rocket assignment fields.
   * Validates height, weight, launchDatetime, and rocketType-specific fields.
   */
  private validateRocketData(data: Partial<IRocketCreate | IRocketUpdate>): void {
    // Height validation
    if (data.height !== undefined && data.height <= 0) {
      throw new BadRequestException('Height must be greater than 0', { code: 'invalid-height' });
    }

    // Weight validation
    if (data.weight !== undefined && data.weight <= 0) {
      throw new BadRequestException('Weight must be greater than 0', { code: 'invalid-weight' });
    }

    // Launch datetime validation
    if (data.launchDatetime !== undefined) {
      const launchDate = new Date(data.launchDatetime);
      if (launchDate <= new Date()) {
        throw new BadRequestException('Launch datetime must be in the future', { code: 'invalid-launch-datetime' });
      }
    }

    // RocketType-specific validation
    if (data.rocketType === RocketType.Commercial) {
      // Commercial rockets must have passengers, no crew
      if (data.crew && data.crew.length > 0) {
        throw new BadRequestException('Commercial rockets cannot have crew members', { code: 'invalid-crew' });
      }
    } else if (data.rocketType === RocketType.SpaceExploration) {
      // Space exploration rockets must have exactly 3 crew members, no passengers
      if (data.passengers && data.passengers.length > 0) {
        throw new BadRequestException('Space exploration rockets cannot have passengers', { code: 'invalid-passengers' });
      }
      if (data.crew && data.crew.length !== 3) {
        throw new BadRequestException('Space exploration rockets must have exactly 3 crew members', {
          code: 'invalid-crew-count',
        });
      }
    }
  }

  async update(where: { id: string; ownerId?: string }, data: IRocketUpdate): Promise<IRocket> {
    const rocket = await this.rocketRepository.find(where);
    if (!rocket) {
      throw new NotFoundException('Rocket not found');
    }

    // Assignment field validation
    this.validateRocketData(data);

    const validationPromises: Promise<IMedia>[] = [];
    if (data.picture?.id) {
      validationPromises.push(this.rocketMediaService.validateMedia(data.picture.id, rocket.id));
    }
    if (data.timelapses) {
      for (const { id } of data.timelapses) {
        if (id) {
          validationPromises.push(this.rocketMediaService.validateMedia(id, rocket.id));
        }
      }
    }
    await Promise.all(validationPromises);

    const mediaToDelete: Array<IMedia | null> = [];

    const updatedRocket = await this.rocketRepository.withTransaction(async (tx) => {
      const rocket = await this.rocketRepository.find(where);
      if (!rocket) {
        throw new NotFoundException('Rocket not found');
      }

      if (data.modelId && data.modelId !== rocket.modelId) {
        const model = await this.rocketModelRepository.find({ id: data.modelId }, tx);
        if (!model) {
          throw new BadRequestException('Model not found');
        }
      }

      if (data.picture !== undefined) {
        const currentPictureId = rocket.picture?.id;
        const newPictureId = data.picture?.id;
        if (currentPictureId && currentPictureId !== newPictureId) {
          mediaToDelete.push(await this.rocketMediaService.markMediaForDeletion(currentPictureId, tx));
        }
      }

      if (data.timelapses !== undefined) {
        const currentTimelapseIds = new Set<string>(
          (rocket.timelapses ?? [])
            .map((t: { id?: string }) => t.id)
            .filter((id: string | undefined): id is string => id !== undefined),
        );
        const newTimelapseIds = new Set<string>((data.timelapses ?? []).map((t: { id: string }) => t.id));
        const timelapsesToDelete = Array.from(currentTimelapseIds).filter((id) => !newTimelapseIds.has(id));
        for (const id of timelapsesToDelete) {
          mediaToDelete.push(await this.rocketMediaService.markMediaForDeletion(id, tx));
        }
      }

      return await this.rocketRepository.update(where, data, tx);
    });

    await Promise.all(
      mediaToDelete
        .filter((media): media is IMedia => media !== null)
        .map((media) => this.rocketMediaService.deleteMedia(media)),
    );

    return await this.rocketMediaService.resolveMedia(updatedRocket);
  }

  async listModels(query?: IRocketModelListQueryDto): Promise<IRocketModel[]> {
    const paginationQuery: IRocketModelPaginationQuery = {
      limit: 100,
      page: 1,
      ...(query?.search && {
        filter: {
          search: query.search,
        },
      }),
    };
    const pagination = await this.rocketModelRepository.paginate(paginationQuery);
    return pagination.items;
  }

  async delete(where: { id: string; ownerId?: string }): Promise<void> {
    const mediaToDelete: Array<IMedia | null> = [];
    await this.rocketRepository.withTransaction(async (tx) => {
      const rocket = await this.rocketRepository.find(where, tx);
      if (!rocket) {
        throw new NotFoundException('Rocket not found');
      }
      if (rocket.picture?.id) {
        mediaToDelete.push(await this.rocketMediaService.markMediaForDeletion(rocket.picture.id, tx));
      }
      if (rocket.timelapses) {
        for (const timelapse of rocket.timelapses) {
          if (timelapse.id) {
            mediaToDelete.push(await this.rocketMediaService.markMediaForDeletion(timelapse.id, tx));
          }
        }
      }
      await this.rocketRepository.delete(where, tx);
    });
    await Promise.all(
      mediaToDelete
        .filter((media): media is IMedia => media !== null)
        .map((media) => this.rocketMediaService.deleteMedia(media)),
    );
  }

  async launch(
    where: { id: string; ownerId?: string },
    data: { launchAfter?: Date; launchDirectorId?: string },
  ): Promise<void> {
    const rocket = await this.find(where);
    if (!rocket) {
      throw new NotFoundException('Rocket not found');
    }
    if (rocket.status === RocketStatusType.Launching) {
      throw new BadRequestException('Rocket already launching');
    }

    const launchDirectorId = data.launchDirectorId ?? rocket.ownerId;

    await this.queueService.enqueue<RocketLaunchJobData>(
      'rocket:launch',
      { rocketId: rocket.id, launchDirectorId },
      { startAfter: data.launchAfter?.toISOString() },
    );
  }

  async listLabels(query: IRocketLabelsRequest): Promise<{ id: string; label: string }[]> {
    return await this.rocketRepository.listLabels(query);
  }

  async paginateModels(query: IRocketModelPaginationQuery): Promise<IPagination<IRocketModel>> {
    return await this.rocketModelRepository.paginate(query);
  }

  async findModel(where: { id: string }): Promise<IRocketModel> {
    const model = await this.rocketModelRepository.find(where);
    if (!model) {
      throw new NotFoundException('Rocket model not found');
    }
    return model;
  }

  async createModel(data: IRocketModelCreate): Promise<IRocketModel> {
    if (data.name) {
      const existing = await this.rocketModelRepository.findByName(data.name);
      if (existing) {
        throw new BadRequestException('Rocket model with this name already exists');
      }
    }
    return await this.rocketModelRepository.create({
      ...data,
      id: data.id ?? makeUUID(),
    });
  }

  async updateModel(where: { id: string }, data: IRocketModelUpdate): Promise<IRocketModel> {
    const model = await this.findModel(where);
    if (data.name && data.name !== model.name) {
      const existing = await this.rocketModelRepository.findByName(data.name);
      if (existing) {
        throw new BadRequestException('Rocket model with this name already exists');
      }
    }
    return await this.rocketModelRepository.update(where, data);
  }

  async deleteModel(where: { id: string }): Promise<void> {
    await this.findModel(where);
    return await this.rocketModelRepository.delete(where);
  }
}
