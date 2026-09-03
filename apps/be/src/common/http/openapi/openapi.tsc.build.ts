#!/usr/bin/env node
/**
 *  Build OpenAPI spec from the API controllers
 *
 *  yarn tsx src/common/http/openapi/scripts/openapi.tsc.build.ts
 */

import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { getConfig } from '~common/config';
import { HttpConfig } from '~common/http/http.config';

// oxlint-disable-next-line import/no-restricted-paths
import { AppModule } from '~app.module';

import { setupOpenApi } from './openapi.helpers';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const { globalPrefix } = getConfig(HttpConfig);
  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  setupOpenApi(app, { verbose: true });
  await app.close();
}

bootstrap().catch((e) => {
  // oxlint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
