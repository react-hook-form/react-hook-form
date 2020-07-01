import ts from 'typescript';
import path from 'path';
import external from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';

const name = 'index';
const umdName = 'ReactHookForm';

export function createRollupConfig(opts, assignedPlugins = []) {
  const shouldMinify =
    opts.minify !== undefined ? opts.minify : opts.env === 'production';

  const tsconfigPath = opts.tsconfig || 'tsconfig.json';
  const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJSON,
    ts.sys,
    './',
  ).options;

  const outputName = [
    path.join(tsCompilerOptions.outDir, name),
    opts.formatName || opts.format,
    opts.env,
    shouldMinify ? 'min' : '',
    'js',
  ]
    .filter(Boolean)
    .join('.');

  return {
    input: opts.input,
    output: {
      file: outputName,
      format: opts.format,
      name: umdName,
      sourcemap: true,
      globals: { react: 'React', 'react-native': 'ReactNative' },
      exports: 'named',
    },
    plugins: [
      external(),
      typescript({
        tsconfig: opts.tsconfig,
        clean: true,
      }),
      resolve(),
      opts.format === 'umd' &&
        commonjs({
          include: /\/node_modules\//,
        }),
      opts.env !== undefined &&
        replace({
          'process.env.NODE_ENV': JSON.stringify(opts.env),
        }),
      sourcemaps(),
      shouldMinify && terser(),
      ...assignedPlugins,
    ],
  };
}
