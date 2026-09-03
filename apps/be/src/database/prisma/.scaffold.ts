import { createScaffolding } from '@povio/scaffold';
import { satisfies } from '@povio/scaffold/plugins/semver';
import { z } from '@povio/scaffold/plugins/zod';

const PrismaScaffoldOptions = z.object({
  mode: z.enum(['disabled', 'enabled', 'purged']).default('disabled'),
  autoMigrate: z.boolean().default(false),
  databaseName: z.string().optional(),
});

export default createScaffolding({
  name: '~database/prisma',

  configSchema: PrismaScaffoldOptions,

  async init({ config, modules }, { addRequest, setStatus, addMessage }) {
    await addRequest({
      match: 'tsconfig:exclude',
      value: { path: 'src/database/prisma', excluded: config!.mode === 'disabled', context: '[all]' },
    });

    if (config!.mode === 'disabled') {
      setStatus('disabled');
      return;
    }

    const projectName = modules['project']?.config?.name ?? 'myapp';
    const databaseName = config!.databaseName ?? projectName;

    // todo purged mode

    await addRequest({
      match: 'dot-config:configure',
      description: 'inject basic prisma config into deployment configs',
      value: {
        stage: '[deployed]',
        state: 'created',
        value: {
          prisma: {
            url: '${env:DATABASE_URL}',
            log: ['info', 'warn', 'error'],
            autoMigrate: config!.autoMigrate,
          },
        },
      },
    });

    await addRequest({
      match: 'dot-config:configure',
      description: 'inject basic prisma config into local config',
      value: {
        stage: '[local]',
        state: 'created',
        value: {
          prisma: {
            log: ['query', 'info', 'warn', 'error'],
          },
        },
      },
    });

    await addRequest({
      match: 'dot-config:configure',
      description: 'inject basic prisma config into local config',
      value: {
        stage: 'local',
        state: 'equals',
        value: {
          'prisma.url': `postgresql://admin:admin@localhost:5432/${databaseName}`,
        },
      },
    });

    await addRequest({
      match: 'dot-config:configure',
      description: 'inject basic prisma config into local config',
      value: {
        stage: 'test',
        state: 'equals',
        value: {
          'prisma.url': `postgresql://admin:admin@localhost:5433/${databaseName}-test`,
          'prisma.autoConnect': false,
        },
      },
    });

    await addRequest({
      match: 'docker-compose:configure',
      description: 'inject basic postgres service into docker-compose',
      value: {
        state: 'created',
        value: {
          'services.postgres': {
            image: 'postgres:15.6-alpine',
            ports: ['5432:5432'],
            volumes: ['postgres-data:/var/lib/postgresql/data'],
            environment: {
              POSTGRES_USER: 'admin',
              POSTGRES_PASSWORD: 'admin',
            },
          },
          'volumes.postgres-data': {},
        },
      },
    });

    if (config!.autoMigrate) {
      await addRequest({
        match: 'scripts:set',
        description: 'inject prisma runtime migrate script',
        value: {
          module: 'docker-start.d',
          state: 'created',
          name: '30_prisma.mjs',
          value:
            // language=javascript
            `#!/usr/bin/env zx

import { $ } from 'zx';

// get Prisma environment variables
const DATABASE_AUTO_MIGRATE = (
  await $\`resolve-config get --target resolved --property prisma.autoMigrate\`
).stdout.trim();

$.env.PRISMA_HIDE_UPDATE_MESSAGE = '1';
$.env.CHECKPOINT_DISABLE = '1';

await $\`prisma generate --no-hints\`;

if (DATABASE_AUTO_MIGRATE === 'true') {
  // migrate prisma database
  await $\`prisma migrate deploy\`;
}
`,
        },
      });
    }
  },
});
