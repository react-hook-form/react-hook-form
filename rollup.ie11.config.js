import { getConfig } from './rollup.config';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { DEFAULT_EXTENSIONS } from '@babel/core';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  output: [
    {
      file: `dist/${pkg.name}.ie11.js`,
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [
    resolve(),
    commonjs({
      include: 'node_modules/**',
    }),
    babel({
      extensions: [...DEFAULT_EXTENSIONS, '.ts', '.tsx'],
      exclude: 'node_modules/**',
      babelrc: false,
      runtimeHelpers: true,
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          '@babel/preset-env',
          {
            targets: {
              esmodules: true,
            },
            bugfixes: true,
          },
          {
            corejs: 3,
          },
        ],
      ],
    }),
  ],
});
