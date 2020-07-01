import { createRollupConfig } from './createRollupConfig';
import pkg from '../package.json';

const options = [
  {
    format: 'cjs',
    env: 'development',
    input: pkg.source,
  },
  {
    format: 'cjs',
    env: 'production',
    input: pkg.source,
  },
  { format: 'esm', input: pkg.source },
  {
    format: 'umd',
    env: 'development',
    input: pkg.source,
  },
  {
    format: 'umd',
    env: 'production',
    input: pkg.source,
  },
];

export default options.map((option) => createRollupConfig(option));
