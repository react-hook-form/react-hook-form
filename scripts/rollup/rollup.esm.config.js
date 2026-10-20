import pkg from '../../package.json';

import { createRollupConfig } from './createRollupConfig';

export default [
  createRollupConfig({
    name: 'index',
    format: 'esm',
    input: pkg.source,
  }),
  createRollupConfig({
    name: 'devtools',
    format: 'esm',
    input: 'src/devtools/index.ts',
  }),
];
