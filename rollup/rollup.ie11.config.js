import { getConfig } from './rollup.config';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import pkg from '../package.json';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  output: [
    {
      file: pkg["main:ie"],
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    getBabelOutputPlugin({
      plugins: [
        ['@babel/plugin-transform-runtime',
          {
            corejs: 3,
          }
        ]
      ],
    })
  ]
});
