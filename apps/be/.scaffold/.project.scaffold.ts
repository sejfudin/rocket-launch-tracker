import { createScaffolding } from '@povio/scaffold';
import { z } from '@povio/scaffold/plugins/zod';

export default createScaffolding({
  name: 'project',

  configSchema: z.object({
    name: z.string().regex(/^[a-z][a-z0-9-]+$/),
    title: z.string().optional(),
    description: z.string().optional(),
  }),

  async init({ config }, { addRequest }) {
    await addRequest({
      match: 'docker-compose:configure',
      description: 'set project name in docker compose',
      value: {
        state: 'equals',
        value: {
          name: config!.name,
        },
      },
    });

    await addRequest({
      match: 'dot-config:configure',
      value: {
        stage: '[deployed]',
        state: 'equals',
        value: {
          ['http.openapi.title']: config!.title,
          ['http.openapi.description']: config!.description ?? '',
        },
      },
    });

    if (config!.description) {
      await addRequest({
        match: 'package.json:value',
        description: 'set project description',
        value: { path: 'description', value: config!.description, state: 'equals' },
      });
    }
  },
});
