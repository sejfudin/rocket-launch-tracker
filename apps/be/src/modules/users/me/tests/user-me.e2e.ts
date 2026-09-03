import { HttpStatus, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { PrismaService } from '~database/prisma';
import { type PrismaClient } from '~database/prisma/client';

import { UserMeModule } from '~modules/users/me';
import { UserFixture } from '~modules/users/user/tests/user.fixture';

import { createAppTestingModule } from '~test/utils';

describe('User Me', () => {
  let app: INestApplication;
  let prismaClient: PrismaClient;

  beforeAll(async () => {
    app = await createAppTestingModule({
      imports: [UserMeModule],
    });

    prismaClient = app.get(PrismaService).client;
  });

  it('should update and return the current user', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaClient, { roles: ['client'] });

    await request(app.getHttpServer())
      .put('/user/me')
      .send({ name: 'Bot' })
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.OK);

    const { body } = await request(app.getHttpServer())
      .get('/user/me')
      .set('Authorization', user.authorizationHeader)
      .expect(HttpStatus.OK);

    expect(body).toEqual(
      expect.objectContaining({
        name: 'Bot',
      }),
    );
  });
});
