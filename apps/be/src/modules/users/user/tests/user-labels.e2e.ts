import { type INestApplication } from '@nestjs/common';
import { beforeAll, describe, it } from 'vitest';

import { makeId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';

import { UserModule } from '~modules/users/user';
import { UserLabelsField, UserLabelsName } from '~modules/users/user/models/user-labels.request';
import { UserFixture } from '~modules/users/user/tests/user.fixture';
import { UserService } from '~modules/users/user/user.service';

import { createAppTestingModule } from '~test/utils';

describe('UserService Labels', () => {
  let app: INestApplication;
  let userService: UserService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    app = await createAppTestingModule({
      imports: [
        //
        UserModule,
      ],
    });
    prismaService = app.get(PrismaService);

    userService = app.get(UserService);
    prismaService = app.get(PrismaService);
  });

  it('email - should return email labels', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client, { name: `Test ${makeId()}` });
    const labels = await userService.listLabels({
      field: UserLabelsField.EMAIL,
      name: UserLabelsName.EMAIL,
      search: user.entity.email!,
    });
    expect(labels.find((l) => l.id === user.entity.email)).toBeDefined();
  });

  it('name - should return name labels', async ({ expect }) => {
    const user = await UserFixture.fromPartial(prismaService.client, { name: `Test ${makeId()}` });
    const labels = await userService.listLabels({
      field: UserLabelsField.ID,
      name: UserLabelsName.NAME,
      search: user.entity.name!,
    });
    expect(labels.find((l) => l.label === user.entity.name)).toBeDefined();
  });
});
