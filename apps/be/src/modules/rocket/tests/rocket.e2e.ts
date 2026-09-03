import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { PushNotificationModule } from '~common/push-notifications';
import { PrismaPushNotificationTokenPersistorPlugin } from '~common/push-notifications/persistors/prisma';
import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { RocketModule } from '~modules/rocket';
import { type RocketCreateRequest, type RocketUpdateRequest } from '~modules/rocket/models';
import { RocketPrismaRepositoryPlugin } from '~modules/rocket/persistors/prisma';
import { RocketFixture } from '~modules/rocket/tests/rocket.fixture';
import { RocketModelFixture } from '~modules/rocket/tests/rocket-model.fixture';
import { UserFixture } from '~modules/users/user/tests/user.fixture';

import { createAppTestingModule } from '~test/utils';

describe('Rocket', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await createAppTestingModule({
      imports: [
        //
        PrismaEphemeralModule.forFeature([RocketPrismaRepositoryPlugin]),
        PushNotificationModule.forRoot([PrismaPushNotificationTokenPersistorPlugin]),
        RocketModule,
      ],
    });
    prismaService = app.get(PrismaService);
  });

  it('should CRUD rockets as a manager', async ({ expect }) => {
    const manager = await UserFixture.fromPartial(prismaService.client, { roles: ['manager'] });
    const modelFixture = await RocketModelFixture.fromPartial(prismaService.client);

    const rocketFixture = await RocketFixture.fromPartial(
      prismaService.client,
      {
        name: 'Pretty Bird',
      },
      {
        model: modelFixture,
      },
    );

    const name = `Pretty Bird ${makeId()}`;
    // create a new rocket
    const response1 = await request(app.getHttpServer())
      .post('/rockets')
      .set('Authorization', manager.authorizationHeader)
      .send({
        name,
        modelId: modelFixture.entity.id,
      } satisfies RocketCreateRequest)
      .expect(201);

    expect(response1.body).toEqual(
      expect.objectContaining({
        model: modelFixture.entity.name,
        name,
      }),
    );

    // get the rocket
    const response2 = await request(app.getHttpServer())
      .get(`/rockets/${rocketFixture.entity.id}`)
      .set('Authorization', manager.authorizationHeader)
      .send()
      .expect(200);

    expect(response2.body).toEqual(
      expect.objectContaining({
        id: rocketFixture.entity.id,
        name: rocketFixture.entity.name,
        model: modelFixture.entity.name,
      }),
    );

    const name2 = `Blue Bird ${makeId()}`;
    // update the rocket
    const response3 = await request(app.getHttpServer())
      .put(`/rockets/${rocketFixture.entity.id}`)
      .set('Authorization', manager.authorizationHeader)
      .send({
        name: name2,
      } satisfies RocketUpdateRequest)
      .expect(200);

    expect(response3.body).toEqual(
      expect.objectContaining({
        id: rocketFixture.entity.id,
        name: name2,
        model: modelFixture.entity.name,
      }),
    );

    // delete the rocket
    const response4 = await request(app.getHttpServer())
      .delete(`/rockets/${rocketFixture.entity.id}`)
      .set('Authorization', manager.authorizationHeader)
      .send()
      .expect(200);

    expect(response4.body).toEqual(expect.objectContaining({ message: 'Rocket deleted' }));
  });

  it('should CRUD rockets as a user', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client, { roles: ['client'] });
    const modelFixture = await RocketModelFixture.fromPartial(prismaService.client);

    const rocketFixture = await RocketFixture.fromPartial(
      prismaService.client,
      {
        name: `Pretty Bird ${makeId()}`,
      },
      {
        owner: user,
        model: modelFixture,
      },
    );

    const name = `Pretty Bird ${makeId()}`;

    // get the rocket
    const response2 = await request(app.getHttpServer())
      .get(`/rockets/${rocketFixture.entity.id}?ownerId=${user.entity.id}`)
      .set('Authorization', user.authorizationHeader)
      .send()
      .expect(200);

    expect(response2.body).toEqual(
      expect.objectContaining({
        id: rocketFixture.entity.id,
        name: rocketFixture.entity.name,
        model: modelFixture.entity.name,
      }),
    );

    const name2 = `Blue Bird ${makeId()}`;
    // update the rocket
    const response3 = await request(app.getHttpServer())
      .put(`/rockets/${rocketFixture.entity.id}?ownerId=${user.entity.id}`)
      .set('Authorization', user.authorizationHeader)
      .send({
        name: name2,
      } satisfies RocketUpdateRequest)
      .expect(200);

    expect(response3.body).toEqual(
      expect.objectContaining({
        id: rocketFixture.entity.id,
        name: name2,
        model: modelFixture.entity.name,
      }),
    );

    // create a new rocket
    const response1 = await request(app.getHttpServer())
      .post('/rockets')
      .set('Authorization', user.authorizationHeader)
      .send({
        name,
        modelId: modelFixture.entity.id,
      } satisfies RocketCreateRequest)
      .expect(201);

    expect(response1.body).toEqual(
      expect.objectContaining({
        model: modelFixture.entity.name,
        name,
      }),
    );

    // delete the rocket
    const response4 = await request(app.getHttpServer())
      .delete(`/rockets/${rocketFixture.entity.id}?ownerId=${user.entity.id}`)
      .set('Authorization', user.authorizationHeader)
      .send()
      .expect(200);

    expect(response4.body).toEqual(expect.objectContaining({ message: 'Rocket deleted' }));
  });
});
