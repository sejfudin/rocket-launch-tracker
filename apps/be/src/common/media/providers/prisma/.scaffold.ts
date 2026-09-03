import { createScaffolding } from '@povio/scaffold';
import { z } from '@povio/scaffold/plugins/zod';

export default createScaffolding({
  name: '~common/media/providers/prisma',

  configSchema: z.object({
    mode: z.enum(['disabled', 'enabled']).default('disabled'),
  }),

  async init({ config }, { setStatus, addRequest }) {
    if (config!.mode === 'disabled') {
      setStatus('disabled');
      return;
    }

    await addRequest({
      match: 'dot-config:configure',
      value: {
        stage: '[local]',
        state: 'created',
        value: {
          'media.prisma.secret': 'random-secret',
        },
      },
    });
  },
});
