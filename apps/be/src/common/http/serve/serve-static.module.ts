import fs from 'node:fs';
import path from 'node:path';

import { Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Express, NextFunction, Request, Response } from 'express';
import * as express from 'express';

import { getConfigFactory } from '~common/config';
import { LoggerService } from '~common/logger';

import { ServeStaticConfig } from './serve-static.config';

/**
 * Serve static files
 */
@Module({
  providers: [getConfigFactory(ServeStaticConfig)],
})
export class HttpServeStaticModule implements OnModuleInit {
  private readonly loggerService = new LoggerService('HttpServeStatic');

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly serveStaticConfig: ServeStaticConfig,
  ) {}

  onModuleInit() {
    if (!this.serveStaticConfig.enabled) {
      return;
    }

    const app: Express = this.httpAdapterHost.httpAdapter.getInstance();
    const log = this.serveStaticConfig.log;

    this.serveStaticConfig.paths?.forEach(({ serveRoot, rootPath, fallbackIndex, serveStaticOptions, exclude }) => {
      const serveStatic = express.static(rootPath, serveStaticOptions);

      const fallbackFile =
        fallbackIndex && fs.existsSync(path.resolve(path.join(rootPath, fallbackIndex)))
          ? path.resolve(path.join(rootPath, fallbackIndex))
          : null;

      app.use(serveRoot, (req: Request, res: Response, next: NextFunction) => {
        if (exclude?.some((e) => req.originalUrl.startsWith(e))) {
          next(); // excluded
        } else {
          if (!log) {
            (req as unknown as { _no_log: boolean })._no_log = true;
          }
          serveStatic(req, res, () => {
            if (fallbackFile) {
              res.sendFile(fallbackFile); // fallback to index.html
            } else {
              delete (req as unknown as { _no_log?: boolean })._no_log;
              next();
            }
          });
        }
      });

      this.loggerService.log(`Serving static files from ${rootPath} at ${serveRoot}`);
    });
  }
}
