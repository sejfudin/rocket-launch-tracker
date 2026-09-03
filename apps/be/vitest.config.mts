/* oxlint-disable */

import { createRequire } from 'module';

import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

const root = import.meta.url;

const tsconfigJson = createRequire(root)('./tsconfig.json');

process.env.STAGE = 'test';

export default defineConfig({
  test: {
    root: './',
    include: [
      /**
       * unit - not using any external service
       * e2e - end-to-end test trough several (including external) services
       */
      '{src,test}/**/*.{unit,e2e}.ts',
    ],
    exclude: [...configDefaults.exclude, ...tsconfigJson.exclude],
    alias: {
      '~*': './src/*',
      '@test/*': 'test/*',
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: './.tmp/coverage',
    },
  },
  plugins: [
    // needed for nest.js decorator support
    swc.vite({
      module: { type: 'es6' },
    }),
    tsconfigPaths(),
  ],
});
