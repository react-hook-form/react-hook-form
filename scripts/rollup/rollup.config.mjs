import pkg from '../../package.json' assert { type: "json" };

import { createRollupConfig } from './createRollupConfig.mjs';

const name = 'index';
const options = [
  {
    name,
    format: 'cjs',
    input: pkg.source,
  },
  { name, format: 'esm', input: pkg.source },
  {
    name,
    format: 'umd',
    input: pkg.source,
  },
];

export default options.map((option) => createRollupConfig(option));
