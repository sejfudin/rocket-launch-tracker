import { BadRequestException, Injectable } from '@nestjs/common';

import { LoggerService } from '~common/logger';
import { IMedia, MediaService } from '~common/media';

import { Transaction } from '~database/types';

import { MediaLibrary } from '~modules/media';

import type { IRocket } from './models';

@Injectable()
export class RocketMediaService {
  constructor(
    private readonly mediaService: MediaService,
    private readonly logger: LoggerService,
  ) {}

  async validateMedia(mediaId: string, rocketId: string): Promise<IMedia> {
    const media = await this.mediaService.validate(mediaId, MediaLibrary.SmallImage);
    const resourceName = `rocket:${rocketId}`;
    if (media.resourceName === MediaLibrary.SmallImage.name) {
      // new image
      await this.mediaService.associate(
        media,
        {
          module: 'rocket',
          resourceName,
          type: 'picture',
          resourceId: rocketId,
        },
        { override: true },
      );
    } else if (media.resourceName !== resourceName) {
      // existing image
      throw new BadRequestException('Media does not belong to rocket');
    }
    return media;
  }

  async markMediaForDeletion(mediaId: string, tx?: Transaction): Promise<IMedia | null> {
    return await this.mediaService.markForDeletion({ id: mediaId }, tx);
  }

  async deleteMedia(media: IMedia): Promise<void> {
    await this.mediaService.deleteMedia(media);
  }

  /**
   * Apply media fetch requests to the rocket
   */
  async resolveMedia<T extends IRocket[] | IRocket>(rocket: T): Promise<T> {
    const rockets: IRocket[] = Array.isArray(rocket) ? rocket : [rocket];

    const pictureIds: string[] = rockets
      .map((r) => [r.picture?.id, ...(r.timelapses ?? []).map((x) => x.id)])
      .flat()
      .filter((x) => x !== undefined);

    const mediaRequests = await this.mediaService.createMediaFetchRequests(pictureIds);

    for (const rocket of rockets) {
      if (rocket.picture?.id && mediaRequests[rocket.picture?.id]) {
        rocket.picture = { ...mediaRequests[rocket.picture?.id] };
      }
      if (rocket.timelapses) {
        rocket.timelapses = rocket.timelapses.map((t) => {
          return t.id && mediaRequests[t.id] ? { ...t, ...mediaRequests[t.id] } : t;
        });
      }
    }

    return Array.isArray(rocket) ? (rockets as T) : (rockets[0] as T);
  }
}
