import { createScaffolding } from '@povio/scaffold';
import { z } from '@povio/scaffold/plugins/zod';

export default createScaffolding({
  name: '~common/email',

  configSchema: z.object({
    mode: z.enum(['disabled', 'enabled']).default('disabled'),
    provider: z.string().default('aws-ses'),
  }),

  async init({ config }, { setStatus, addRequest }) {
    const enabled = config!.mode !== 'disabled';

    await addRequest({
      match: 'tsconfig:exclude',
      value: { path: 'src/common/email', excluded: !enabled, context: '[all]' },
    });

    if (!enabled) {
      setStatus('disabled');
      return;
    }
  },
});
