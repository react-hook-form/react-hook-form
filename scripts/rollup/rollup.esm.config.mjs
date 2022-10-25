import pkg from '../../package.json' assert { type: "json" };

import { createRollupConfig } from './createRollupConfig.mjs';

export default createRollupConfig({
  name: 'index',
  format: 'esm',
  input: pkg.source,
});
