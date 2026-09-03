import 'reflect-metadata';

// hook: instrumentation

import { NestFactory } from '@nestjs/core';

import { getConfig } from '~common/config';
import { HttpConfig } from '~common/http/http.config';
import { noticeOpenApi } from '~common/http/openapi/openapi.helpers';
import { LoggerService } from '~common/logger';

import { AppModule } from '~app.module';

import { requestPipes } from '~app.pipes';

const logger = new LoggerService('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  /**
   * Enable onApplicationShutdown lifecycle hook for graceful shutdown
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  app.enableShutdownHooks();

  const { globalPrefix, port, host } = getConfig(HttpConfig);
  if (globalPrefix) {
    app.setGlobalPrefix(globalPrefix);
  }

  /**
   * Load global pipes for
   *  - logging, metrics
   *  - error handling
   */
  requestPipes(app);

  await app.listen(port, host);
  logger.log(`Listening on ${host}:${port}${globalPrefix ? `/${globalPrefix}` : ''}`);
  noticeOpenApi();
}
bootstrap().catch((e) => {
  logger.error(e);
  throw e;
});
