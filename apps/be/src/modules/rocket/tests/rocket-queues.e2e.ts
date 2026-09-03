import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { PushNotificationModule } from '~common/push-notifications';
import { PrismaPushNotificationTokenPersistorPlugin } from '~common/push-notifications/persistors/prisma';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { RocketModule } from '~modules/rocket';
import { RocketLaunchRequest, RocketStatusType } from '~modules/rocket/models';
import { RocketPrismaRepositoryPlugin } from '~modules/rocket/persistors/prisma';
import { RocketConfig } from '~modules/rocket/rocket.config';
import { RocketFixture } from '~modules/rocket/tests/rocket.fixture';
import { RocketModelFixture } from '~modules/rocket/tests/rocket-model.fixture';
import { UserFixture } from '~modules/users/user/tests/user.fixture';

import { createAppTestingModule } from '~test/utils';

describe('Rocket Queues', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await createAppTestingModule(
      {
        imports: [
          PrismaEphemeralModule.forFeature([RocketPrismaRepositoryPlugin]),
          PushNotificationModule.forRoot([PrismaPushNotificationTokenPersistorPlugin]),
          RocketModule,
        ],
      },
      {
        overrideProviders: [[RocketConfig, { speedFactor: 0 }]],
      },
    );
    prismaService = app.get(PrismaService);
  });

  it('should launch a rocket using hotwire queue provider', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client, { roles: ['client'] });
    const modelFixture = await RocketModelFixture.fromPartial(prismaService.client, {
      name: 'Starship',
      organization: 'SpaceX',
    });

    const rocketFixture = await RocketFixture.fromPartial(
      prismaService.client,
      {
        name: 'Test Rocket',
        status: RocketStatusType.Ready,
      },
      {
        owner: user,
        model: modelFixture,
      },
    );

    // Launch the rocket
    const launchResponse = await request(app.getHttpServer())
      .post(`/rockets/${rocketFixture.entity.id}/launch?ownerId=${user.entity.id}`)
      .set('Authorization', user.authorizationHeader)
      .send({} satisfies RocketLaunchRequest)
      .expect(201);

    expect(launchResponse.body).toEqual(
      expect.objectContaining({
        code: 'launched',
        message: 'Rocket launched',
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    const rocketResponse = await request(app.getHttpServer())
      .get(`/rockets/${rocketFixture.entity.id}?ownerId=${user.entity.id}`)
      .set('Authorization', user.authorizationHeader)
      .send()
      .expect(200);

    expect(rocketResponse.body.status).toMatch(
      new RegExp(`${RocketStatusType.InFlight}|${RocketStatusType.Exploded}|${RocketStatusType.Launching}`),
    );
  });
});
