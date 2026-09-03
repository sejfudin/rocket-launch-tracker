export default {
  name: '~common/config',
  requests: [{ match: 'package.json:dependency', value: { pkg: '@povio/resolve-config@^1.0.9' } }],
};
