import { createScaffolding } from '@povio/scaffold';
import { z } from '@povio/scaffold/plugins/zod';

const OpenApiScaffoldOptions = z.object({
  mode: z.enum(['disabled', 'runtime', 'static', 'combined']).default('disabled'),
  plugins: z.array(z.enum(['swagger-ui'])).optional(),
});

export type IOpenApiScaffoldOptions = z.infer<typeof OpenApiScaffoldOptions>;

export default createScaffolding({
  name: '~common/http/openapi',

  configSchema: OpenApiScaffoldOptions,

  async init({ config, modules }, { setStatus, addRequest }) {
    const enabled = config!.mode !== 'disabled';

    await addRequest({
      match: 'tsconfig:exclude',
      value: { path: 'src/common/http/openapi', excluded: !enabled, context: '[all]' },
    });

    await addRequest({
      match: 'nest-cli.json:plugin',
      description: 'add swagger plugin',
      value: {
        name: '@nestjs/swagger',
        options: {
          introspectComments: true,
        },
        mode: ['runtime', 'combined'].includes(config!.mode) ? 'enabled' : 'disabled',
      },
    });

    await addRequest({
      match: 'package.json:dependency',
      value: {
        pkg: '@nestjs/swagger@^11.1.2',
        state: enabled ? 'installed' : 'missing',
        dev: config!.mode === 'static',
      },
    });

    if (enabled) {
      await addRequest({
        match: '~app.pipes:activate',
        value: {
          fileImports: [['setupOpenApi', '~common/http/openapi/openapi.helpers']],
          position: 'after-interceptors',
          statement: 'setupOpenApi(app);',
        },
      });
    }

    if (enabled) {
      await addRequest({
        match: 'dot-config:configure',
        value: {
          stage: '[deployed]',
          state: 'created',
          value: {
            'http.openapi.serve.main': {
              serve: 'static',
              path: 'docs',
              title: modules['project']?.config!.name,
              description: 'API Documentation',
            },
          },
        },
      });
      await addRequest({
        match: 'dot-config:configure',
        value: {
          stage: 'local',
          state: 'created',
          value: {
            'http.openapi': {
              serve: 'runtime',
              path: 'docs',
              title: modules['project']?.config!.name,
              description: 'API Documentation',
            },
          },
        },
      });
    }

    if (!enabled) {
      setStatus('disabled');
      return;
    }
  },
});
