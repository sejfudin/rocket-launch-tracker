import { createScaffolding } from '@povio/scaffold';

export default createScaffolding({
  name: '~common/http',

  async init(_, { addRequest }) {
    for (const value of [
      { pkg: '@types/express@^5.0.1', dev: true },
      { pkg: '@nestjs/platform-express@^11.0.16' },
      { pkg: 'luxon@^3.6.1' },
      { pkg: '@types/luxon@^3.6.2', dev: true },
    ]) {
      await addRequest({
        match: 'package.json:dependency',
        value,
      });
    }

    // request-ip
    for (const value of [{ pkg: 'request-ip@^3.3.0' }, { pkg: '@types/request-ip@^0.0.41', dev: true }]) {
      await addRequest({ match: 'package.json:dependency', value });
    }

    await addRequest({
      priority: 100,
      match: 'dot-config:configure',
      value: {
        stage: '[deployed]',
        state: 'created',
        value: {
          'http.port': '${env:PORT}',
        },
      },
    });
  },
});
