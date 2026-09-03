import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, it } from 'vitest';

import { ActivityModule } from '~common/activities';
import { ActivityService } from '~common/activities/activity.service';
import { ActivityAggregationTimeBucket } from '~common/activities/models/activity-aggregation.request';
import { LoggerModule } from '~common/logger';
import { makeUUID } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { PrismaActivityPersistorPlugin } from '../activity.prisma-repository';
import { ActivityFixture } from './activity.fixture';

describe('ActivityService with Prisma Repository', () => {
  let app: INestApplication;
  let activityService: ActivityService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule,
        PrismaEphemeralModule.forRoot([PrismaActivityPersistorPlugin]),
        ActivityModule.forRoot([PrismaActivityPersistorPlugin]),
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    activityService = app.get(ActivityService);
    prismaService = app.get(PrismaService);
  });

  it('should create an activity', async ({ expect }) => {
    const module = makeUUID();
    const activity = await activityService.create({
      module,
      type: 'test-type',
      payload: { key: 'value' },
      metadata: { extra: 'data' },
    });

    expect(activity).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        module,
        type: 'test-type',
        payload: { key: 'value' },
        metadata: { extra: 'data' },
        timestamp: expect.any(Date),
      }),
    );
  });

  it('should find an activity by id', async ({ expect }) => {
    const module = makeUUID();
    const fixture = await ActivityFixture.fromPartial(prismaService.client, {
      module,
      type: 'test-type',
      payload: { key: 'value' },
    });

    const activity = await activityService.find({ id: fixture.entity.id });

    expect(activity).toEqual(
      expect.objectContaining({
        id: fixture.entity.id,
        module,
        type: 'test-type',
        payload: { key: 'value' },
      }),
    );
  });

  it('should return null when activity not found', async ({ expect }) => {
    const activity = await activityService.find({ id: makeUUID() });

    expect(activity).toBeNull();
  });

  it('should paginate activities', async ({ expect }) => {
    const module = makeUUID();
    await Promise.all([
      ActivityFixture.fromPartial(prismaService.client, { module, type: 'type-1' }),
      ActivityFixture.fromPartial(prismaService.client, { module, type: 'type-2' }),
      ActivityFixture.fromPartial(prismaService.client, { module: makeUUID(), type: 'type-1' }),
    ]);

    const result = await activityService.paginate({
      page: 1,
      limit: 10,
      filter: {
        module,
      },
    });

    expect(result.items).toHaveLength(2);

    expect(result.items.every((item) => item.module === module)).toBe(true);
  });

  it('should filter activities by filters', async ({ expect }) => {
    const module = makeUUID();
    const resourceId = makeUUID();
    const userId = makeUUID();

    await ActivityFixture.fromPartial(prismaService.client, {
      module,
      type: 'type-1',
      resourceId,
      userId,
    });
    await ActivityFixture.fromPartial(prismaService.client, {
      module,
      type: 'type-1',
      resourceId: makeUUID(),
    });

    expect(
      await activityService.paginate({
        page: 1,
        limit: 10,
        filter: {
          resourceId,
        },
      }),
    ).toEqual(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            resourceId,
          }),
        ]),
      }),
    );

    expect(
      await activityService.paginate({
        page: 1,
        limit: 10,
        filter: {
          userId,
        },
      }),
    ).toEqual(expect.objectContaining({ items: expect.arrayContaining([expect.objectContaining({ userId })]) }));

    expect(
      await activityService.paginate({
        page: 1,
        limit: 10,
        filter: {
          module,
        },
      }),
    ).toEqual(expect.objectContaining({ items: expect.arrayContaining([expect.objectContaining({ module })]) }));

    expect(
      await activityService.paginate({
        page: 1,
        limit: 10,
        filter: {
          type: 'type-1',
        },
      }),
    ).toEqual(
      expect.objectContaining({ items: expect.arrayContaining([expect.objectContaining({ type: 'type-1' })]) }),
    );
  });

  it('should filter activities by timestamp range', async ({ expect }) => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const middleDate = new Date('2024-01-15');

    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'test-module',
      type: 'type-1',
      timestamp: new Date('2023-12-31'),
    });
    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'test-module',
      type: 'type-1',
      timestamp: middleDate,
    });
    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'test-module',
      type: 'type-1',
      timestamp: new Date('2024-02-01'),
    });

    const result = await activityService.paginate({
      page: 1,
      limit: 10,
      filter: {
        timestamp: {
          start: startDate,
          end: endDate,
        },
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].timestamp).toEqual(middleDate);
  });

  it('should aggregate activities by time bucket', async ({ expect }) => {
    const baseDate = new Date('2024-01-15T10:00:00Z');
    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'test-module',
      type: 'type-1',
      timestamp: new Date(baseDate.getTime() - 30 * 60 * 1000),
    });
    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'test-module',
      type: 'type-1',
      timestamp: new Date(baseDate.getTime() + 30 * 60 * 1000),
    });

    const result = await activityService.aggregate({
      timeBucket: ActivityAggregationTimeBucket.hour,
      timestamp: {
        start: new Date(baseDate.getTime() - 60 * 60 * 1000),
        end: new Date(baseDate.getTime() + 60 * 60 * 1000),
      },
    });

    // expect response format
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          bucket: expect.any(Date),
          count: 1,
        }),
      ]),
    );
    expect(result.length).toBe(2);
  });

  it('should aggregate activities filtered by module', async ({ expect }) => {
    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'test-module',
      type: 'type-1',
    });
    await ActivityFixture.fromPartial(prismaService.client, {
      module: 'other-module',
      type: 'type-1',
    });

    const result = await activityService.aggregate({
      timeBucket: ActivityAggregationTimeBucket.day,
      module: 'test-module',
    });

    expect(result.length).toBeGreaterThan(0);
  });
});
