import pkg from '../../package.json';

import { createRollupConfig } from './createRollupConfig';

const name = 'index';
const options = [
  {
    name,
    format: 'cjs',
    env: 'development',
    input: pkg.source,
  },
  {
    name,
    format: 'cjs',
    env: 'production',
    input: pkg.source,
  },
  { name, format: 'esm', input: pkg.source },
  {
    name,
    format: 'umd',
    env: 'development',
    input: pkg.source,
  },
  {
    name,
    format: 'umd',
    env: 'production',
    input: pkg.source,
  },
];

export default options.map((option) => createRollupConfig(option));
