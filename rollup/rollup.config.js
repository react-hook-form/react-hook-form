import { createRollupConfig } from './createRollupConfig';
import pkg from '../package.json';

const input = pkg.source;
const options = [
  {
    format: 'cjs',
    env: 'development',
    input,
  },
  {
    format: 'cjs',
    env: 'production',
    input,
  },
  { format: 'esm', input },
  {
    format: 'umd',
    env: 'development',
    input,
  },
  {
    format: 'umd',
    env: 'production',
    input,
  },
];

export default options.map((option) => createRollupConfig(option));
