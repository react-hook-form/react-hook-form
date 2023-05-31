import pkg from '../../package.json';

import { createRollupConfig } from './createRollupConfig';

const name = 'index';
const options = [
  {
    name,
    format: 'cjs',
    input: pkg.source,
    external: ['react', 'react-dom'],
  },
  { name, format: 'esm', input: pkg.source, external: ['react', 'react-dom'] },
  {
    name,
    format: 'umd',
    input: pkg.source,
    external: ['react', 'react-dom'],
  },
];

export default options.map((option) => createRollupConfig(option));
