import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { createScaffolding } from '@povio/scaffold';
import glob from '@povio/scaffold/plugins/fast-glob';
import { type Document, parseDocument } from '@povio/scaffold/plugins/yaml';
import { z } from '@povio/scaffold/plugins/zod';

interface YamlFile {
  save: boolean;
  path: string;
  name: string;
  stage: string;
  yaml: Document.Parsed;
}

const files: Record<string, YamlFile> = {};

const templates: Record<string, { ext: string; content: (data: { stage: string }) => string }> = {
  api: {
    ext: '.template.yml',
    content: (data: { stage: string }) => `
## Configuration for STAGE=${data.stage}
##  - ${data.stage}.api.template.yml is commited to git and uses \${} functions
##  - ${data.stage}.api.resolved.yml is generated on "yarn bootstrap --stage ${data.stage}"
##  - ${data.stage}.api.override.yml can be used for local overrides

core:
  stage: \${func:stage}
  release: \${env:RELEASE}
`,
  },
};

/**
 * Get a dot-config file
 */
function getConfigYaml(cwd: string, moduleName: string, stage: string) {
  if (!files[`${stage}.${moduleName}`]) {
    const ext = templates[moduleName]?.ext || '.yml';
    const name = `${stage}.${moduleName}${ext}`;
    const path = join(cwd, '.config', name);
    let yaml;
    if (existsSync(path)) {
      yaml = parseDocument(readFileSync(path, 'utf-8'), {
        prettyErrors: true,
        merge: true,
        keepSourceTokens: true,
      });
    } else {
      const content = templates[moduleName]?.content({ stage }) || '';
      yaml = parseDocument(content, {
        prettyErrors: true,
        merge: true,
        keepSourceTokens: true,
      });
    }
    files[`${stage}.${moduleName}`] = { save: false, path, yaml, name, stage };
  }
  return files[`${stage}.${moduleName}`];
}

export default createScaffolding({
  name: 'dot-config',

  configSchema: z.object({
    bootstrap: z.boolean().default(false),
  }),

  init: async ({ config, cwd }, { addExecutor, addRequest }) => {
    await addExecutor({
      match: 'dot-config:configure',
      description: 'create or update a dot-config file',
      init: async (task, { addMessage }) => {
        const { value, stage, moduleName: _moduleName, state } = task.request.value!;
        const moduleName = _moduleName ?? 'api';

        if (!stage || !moduleName || !state || !value) {
          task.status = 'errored';
          addMessage('error', `stage, moduleName, value, and state are required for dot-config creation`);
          return;
        }

        if (stage === '[local]') {
          for (const s of ['local', 'test']) {
            await addRequest({
              match: 'dot-config:configure',
              value: { ...task.request.value, stage: s },
              description: task.request.description,
            });
          }
          task.status = 'disabled';
          return;
        }

        if (stage === '[all]' || stage === '[deployed]') {
          const ext = templates[moduleName]?.ext || '.yml';
          const stages = new Set([
            ...glob.sync(`*.${moduleName}${ext}`, { cwd: join(cwd, '.config') }).map((f) => f.split('.')[0]),
            ...Object.values(files).map((f) => f.stage),
          ]);
          if (stage === '[deployed]') {
            stages.delete('local');
            stages.delete('test');
          } else if (stage === '[all]') {
            stages.add('local');
            stages.add('test');
          }
          for (const s of Array.from(stages)) {
            await addRequest({
              match: 'dot-config:configure',
              value: { ...task.request.value, stage: s },
              description: task.request.description,
            });
          }
          task.status = 'disabled';
          return;
        }

        const file = getConfigYaml(cwd, moduleName, stage);
        switch (state) {
          case 'created':
            for (const [k, v] of Object.entries(value)) {
              if (!file.yaml.hasIn(k.split('.'))) {
                file.yaml.addIn(k.split('.'), v);
                file.save = true;
                addMessage('info', `${file.name} => create ${k} section`);
                task.status = 'delegated';
              }
            }
            break;
          case 'equals':
            for (const [k, v] of Object.entries(value)) {
              if (!file.yaml.hasIn(k.split('.'))) {
                file.yaml.addIn(k.split('.'), v);
                file.save = true;
                addMessage('info', `${file.name} => create ${k} section`);
                task.status = 'delegated';
              } else if (file.yaml.getIn(k.split('.')) !== v) {
                file.yaml.deleteIn(k.split('.'));
                file.yaml.addIn(k.split('.'), v);
                file.save = true;
                addMessage('info', `${file.name} => update ${k} section`);
                task.status = 'delegated';
              }
            }
            break;
          default:
            throw new Error(`Invalid state ${state} for ${task.id}`);
        }
      },
    });

    await addExecutor({
      match: 'dot-config:#after-all',
      description: 'save dot-config files',
      init: async (task) => {
        if (!Object.values(files).some((f) => f.save)) {
          task.status = 'disabled';
        }
      },
      exec: async () => {
        if (!existsSync(join(cwd, '.config'))) {
          mkdirSync(join(cwd, '.config'));
        }
        Object.values(files)
          .filter((f) => f.save)
          .forEach(({ path, yaml }) => writeFileSync(path, yaml.toString()));
      },
    });
  },
});
