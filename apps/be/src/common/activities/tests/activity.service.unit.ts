import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, it } from 'vitest';

import { ActivityAggregationTimeBucket } from '~common/activities/models';
import { LoggerModule } from '~common/logger';

import { ActivityModule } from '../activity.module';
import { ActivityService } from '../activity.service';
import { NoOpActivityPersistorPlugin } from '../persistors/no-op';

describe('ActivityService with No-Op Repository', () => {
  let app: INestApplication;
  let activityService: ActivityService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [LoggerModule, ActivityModule.forRoot([NoOpActivityPersistorPlugin])],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    activityService = app.get(ActivityService);
  });

  it('should create an activity with no-op repository', async ({ expect }) => {
    const activity = await activityService.create({
      module: 'test-module',
      type: 'test-type',
      payload: { key: 'value' },
    });

    expect(activity).toEqual({
      id: expect.any(String),
      timestamp: expect.any(Date),
      payload: { key: 'value' },
      module: 'test-module',
      type: 'test-type',
    });
  });

  it('should find activity with no-op repository', async ({ expect }) => {
    const activity = await activityService.find({ id: 'any-id' });

    expect(activity).toBeNull();
  });

  it('should paginate activities with no-op repository', async ({ expect }) => {
    const result = await activityService.paginate({
      page: 1,
      limit: 10,
      filter: {
        module: 'test-module',
      },
    });

    expect(result).toEqual({
      items: [],
      limit: 10,
      page: 1,
    });
  });

  it('should aggregate activities with no-op repository', async ({ expect }) => {
    const result = await activityService.aggregate({
      timeBucket: ActivityAggregationTimeBucket.day,
      module: 'test-module',
    });

    expect(result).toEqual([]);
  });
});
