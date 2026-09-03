import { createScaffolding } from '@povio/scaffold';
import { z } from '@povio/scaffold/plugins/zod';

export default createScaffolding({
  name: '~common/authn',

  configSchema: z.object({
    mode: z.enum(['disabled', 'enabled']).default('disabled'),
    providers: z.array(z.string()),
  }),

  async init({ config }, { setStatus, addRequest }) {
    const enabled = config!.mode !== 'disabled';

    await addRequest({
      match: 'tsconfig:exclude',
      value: { path: 'src/common/authn', excluded: !enabled, context: '[all]' },
    });

    if (!enabled) {
      setStatus('disabled');
      return;
    }

    await addRequest({
      match: 'package.json:dependency',
      value: { pkg: 'jsonwebtoken' },
    });
  },
});
