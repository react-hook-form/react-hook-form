import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import path from 'path';
import external from 'rollup-plugin-peer-deps-external';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import ts from 'typescript';

import pkg from '../../package.json';

import { pascalcase } from './pascalcase';
import { safePackageName } from './safePackageName';

export function createRollupConfig(options, callback) {
  const name = options.name || safePackageName(pkg.name);
  const umdName = options.umdName || pascalcase(safePackageName(pkg.name));
  const tsconfigPath = options.tsconfig || 'tsconfig.json';
  const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJSON,
    ts.sys,
    './',
  ).options;

  const outputName = [
    path.join(tsCompilerOptions.outDir, name),
    options.formatName || options.format,
    options.env,
    'js',
  ]
    .filter(Boolean)
    .join('.');

  const config = {
    input: options.input,
    output: {
      file: outputName,
      format: options.format,
      name: umdName,
      sourcemap: true,
      globals: { react: 'React' },
      exports: 'named',
    },
    plugins: [
      external(),
      typescript({
        tsconfig: options.tsconfig,
        clean: true,
      }),
      resolve(),
      options.format === 'umd' &&
        commonjs({
          include: /\/node_modules\//,
        }),
      sourcemaps(),
      terser({
        output: { comments: false },
        compress: {
          drop_console: true,
        },
      }),
    ].filter(Boolean),
  };

  return callback ? callback(config) : config;
}
