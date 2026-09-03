import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { type ReferenceObject, type SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import type { Request, Response } from 'express';
import { stringify as yamlStringify } from 'yaml';

import { getConfig } from '~common/config';
import { CoreConfig } from '~common/core';
import { HttpConfig } from '~common/http/http.config';
import { LoggerService } from '~common/logger';

import { OpenApiConfig } from './openapi.config';

const logger = new LoggerService('OpenApi');

const openApiConfig = getConfig(OpenApiConfig);
const coreConfig = getConfig(CoreConfig);
const httpConfig = getConfig(HttpConfig);

const resourcesFolder = resolve(__dirname, '../../../../', 'resources');

export function filterOpenApiDocument(
  doc: OpenAPIObject,
  options: {
    include?: string;
    exclude?: string;
  },
) {
  const paths = Object.fromEntries(
    Object.entries(doc.paths).reduce(
      (acc, [k, v]) => {
        /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
        const i = Object.fromEntries(
          Object.entries(v).filter(([, v2]) => {
            if (options.exclude) {
              return v2.tags?.every((t: string) => !t.match(options.exclude!));
            } else if (options.include) {
              return v2.tags?.some((t: string) => t.match(options.include!));
            }
            return false;
          }),
        );
        /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
        if (Object.keys(i).length > 0) {
          acc.push([k, i]);
        }
        return acc;
      },
      [] as [string, Record<string, unknown>][],
    ),
  );

  const toAdd = [
    ...new Set([...JSON.stringify(paths).matchAll(/"#\/components\/schemas\/([^"]*)"/g)].map((x) => x[1])),
  ];
  const schemas: Record<string, SchemaObject | ReferenceObject> = {};
  while (toAdd.length > 0) {
    const i = toAdd.pop()!;
    if (!(i in schemas) && doc.components?.schemas?.[i]) {
      schemas[i] = doc.components.schemas[i]!;
      [...JSON.stringify(schemas[i]).matchAll(/"#\/components\/schemas\/([^"]*)"/g)].forEach((x) => {
        if (x[1] && !(x[1] in schemas)) {
          toAdd.push(x[1]);
        }
      });
    }
  }

  return {
    ...doc,
    paths,
    components: {
      ...doc.components,
      schemas,
    },
  };
}

export function getSwaggerDocument(app: INestApplication) {
  let config = new DocumentBuilder()
    .setTitle(openApiConfig.title)
    .setDescription(openApiConfig.description)
    .setVersion(coreConfig.version ?? '0.0.0')
    .addBearerAuth(
      {
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'Authorization',
    );

  config = config.addServer(coreConfig.apiBaseUrl ?? '/');

  return SwaggerModule.createDocument(app, config.build());
}

export function setupOpenApi(app: INestApplication, options?: { verbose?: boolean }) {
  if (openApiConfig.serve && Object.keys(openApiConfig.serve).length > 0) {
    let document;
    const prefix = `${httpConfig.globalPrefix ? `${httpConfig.globalPrefix}/` : ''}`;
    for (const { path, json, yaml, include, exclude, dump } of Object.values(openApiConfig.serve)) {
      if (json || yaml) {
        if (json) {
          // todo, this does not work as it used to
          app.use(`${prefix}${path}-json`, (_req: Request, res: Response) => {
            res.json(JSON.parse(readFileSync(join(resourcesFolder, json), 'utf-8')));
          });
        }
        if (yaml) {
          app.use(`${prefix}${path}-yaml`, (_req: Request, res: Response) => {
            res.json(JSON.parse(readFileSync(join(resourcesFolder, 'resources', yaml), 'utf-8')));
          });
        }
      } else {
        if (!document) {
          document = getSwaggerDocument(app);
        }
        const filteredDocument = include || exclude ? filterOpenApiDocument(document, { include, exclude }) : document;

        if (dump) {
          (async () => {
            if (options?.verbose) {
              logger.log(`Writing document ${dump}`);
            }
            if (dump.endsWith('.json')) {
              writeFileSync(join(resourcesFolder, dump), JSON.stringify(filteredDocument, null, 2));
            } else {
              writeFileSync(join(resourcesFolder, dump), yamlStringify(filteredDocument));
            }
          })();
        }

        SwaggerModule.setup(`${prefix}${path}`, app, filteredDocument, {
          swaggerOptions: {
            persistAuthorization: true,
            tryItOutEnabled: true,
            showExtensions: true,
          },
        });
      }
    }
  }
}

export function noticeOpenApi() {
  if (openApiConfig.serve && Object.keys(openApiConfig.serve).length > 0) {
    const { host, port } = httpConfig;
    const prefix = `${httpConfig.globalPrefix ? `${httpConfig.globalPrefix}/` : ''}`;
    for (const { json, yaml, path } of Object.values(openApiConfig.serve)) {
      if (json || yaml) {
        const text = `Serving static OpenApi on ${host}:${port}/${prefix}`;
        if (json) {
          logger.log(`${text}${path}-json`);
        }
        if (yaml) {
          logger.log(`${text}${path}-yaml`);
        }
      } else {
        logger.log(`Serving OpenApi on ${host}:${port}/${prefix}${path}`);
      }
    }
  }
}
