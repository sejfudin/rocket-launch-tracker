import { Controller, Get, INestApplication } from '@nestjs/common';
import { Request } from 'express';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { AuthnModule } from '~common/authn';
import { NotImplementedAuthnPersistorPlugin } from '~common/authn/persistors/not-implemented';
import { AuthzLoader } from '~common/authz/authz.loader';
import { AuthzProvider } from '~common/authz/authz-provider.abstract';
import { AuthzProviderMock } from '~common/authz/tests/authz.provider.mock';
import { makeUUID } from '~common/utils/short-uuid';

import { USER_AUTHN_KEY } from '~modules/users/auth';

import { AclCheck } from '../authz.decorators';
import { AuthzModule } from '../authz.module';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

@Controller('test')
export class TestController {
  @Get('staff')
  @AclCheck('staff:read', { mytype: '$query.mytype' })
  async staff(): Promise<void> {}

  @Get('staff-poke')
  @AclCheck('staff:poke', { mytype: '$query.mytype', second: '$query.second' })
  async staffPoke(): Promise<void> {}
}

describe('Authz', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createRestTestingModule(
      {
        imports: [AuthnModule.forRoot([NotImplementedAuthnPersistorPlugin]), AuthzModule.forRoot([])],
        controllers: [TestController],
      },
      {
        beforeInit: (a) => {
          // todo, pack into a helper
          a.use((req: Request, res: any, next: any) => {
            const id = makeUUID();
            req.user = {
              userId: id,
              provider: 'hotwire',
              providerId: id,
              id: id,
              namespace: USER_AUTHN_KEY,
              ident: `user:${id}`,
            };
            next();
          });
          return a;
        },
      },
    );

    const authzLoader = app.get(AuthzLoader);
    authzLoader.providers['user'] = AuthzProviderMock.useValue;
  });

  it('access the endpoint', async () => {
    async function runTest(url: string, query: any, applyRules: AuthzProvider['applyRules'], status: number) {
      AuthzProviderMock.useValue.applyRules.mock.mockImplementationOnce(applyRules);
      await request(app.getHttpServer()).get(url).query(query).expect(status);
    }

    await runTest(
      '/test/staff',
      { mytype: 'thing' },
      async (_, builder) => {
        builder.can('read', 'staff', { mytype: 'thing' });
      },
      200,
    );

    // require query
    await runTest(
      '/test/staff',
      {},
      async (_, builder) => {
        builder.can('read', 'staff', { mytype: 'thing' });
      },
      403,
    );

    // query is optional, user has full poke permission
    await runTest(
      '/test/staff-poke',
      { mytype: 'thing' },
      async (_, builder) => {
        builder.can('poke', 'staff');
      },
      200,
    );

    // all items have to match
    await runTest(
      '/test/staff-poke',
      { mytype: 'thing', second: '1' },
      async (_, builder) => {
        builder.can('poke', 'staff', { mytype: 'thing', second: '1' });
      },
      200,
    );

    // all items have to match
    await runTest(
      '/test/staff-poke',
      { mytype: 'thing', second: '2' },
      async (_, builder) => {
        builder.can('poke', 'staff', { mytype: 'thing', second: '1' });
      },
      403,
    );
  });
});
