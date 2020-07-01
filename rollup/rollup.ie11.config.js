import { createRollupConfig } from './createRollupConfig';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import pkg from '../package.json';

const tsconfig = './tsconfig.ie11.json';
const options = [
  {
    format: 'cjs',
    formatName: 'ie11',
    env: 'development',
    input: pkg.source,
    tsconfig,
  },
  {
    format: 'cjs',
    formatName: 'ie11',
    env: 'production',
    input: pkg.source,
    tsconfig,
  },
];

export default options.map((option) =>
  createRollupConfig(option, [
    getBabelOutputPlugin({
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            corejs: 3,
          },
        ],
      ],
    }),
  ]),
);
