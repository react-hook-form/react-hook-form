import pkg from '../../package.json';

import { createRollupConfig } from './createRollupConfig';

const name = 'index';
const options = [
  {
    name,
    format: 'cjs',
    input: pkg.source,
  },
  { name, format: 'esm', input: pkg.source },
  {
    name: 'react-server',
    format: 'esm',
    input: 'src/index.react-server.ts',
  },
  {
    name,
    format: 'umd',
    input: pkg.source,
  },
  { name: 'devtools', format: 'cjs', input: 'src/devtools/index.ts' },
  { name: 'devtools', format: 'esm', input: 'src/devtools/index.ts' },
];

export default options.map((option) => createRollupConfig(option));
