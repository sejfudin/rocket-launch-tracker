import { HttpStatus, type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { HttpHealthModule } from './http-health.module';
import { createBaseTestingModule } from '~test/utils/base.testing-module';

describe('HttpHealth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createBaseTestingModule({
      imports: [HttpHealthModule],
    });
  });

  it('should return health status', async ({ expect }) => {
    expect((await request(app.getHttpServer()).get('/')).status).toBe(HttpStatus.OK);
  });
});
