import { join } from 'node:path';
import 'reflect-metadata';

import { getString, resolveConfigSync } from '@povio/resolve-config';
import type { PrismaConfig } from 'prisma';

import { collect } from './resources/prisma/scripts/collect.mjs';

const config = resolveConfigSync({
  stage: process.env.STAGE,
  module: `config`,
  target: 'resolved',
});

process.env.CHECKPOINT_DISABLE = '1'; // prevent data collection

if (process.argv.includes('generate')) {
  collect();
}

export default {
  schema: join('resources', 'prisma', 'schema'),
  migrations: {
    path: join('resources', 'prisma', 'migrations'),
    seed: 'tsx resources/prisma/seed/seed.ts',
  },
  datasource: {
    url: getString(config, 'prisma.url')!,
  },
} satisfies PrismaConfig;
