import ts from 'typescript';
import path from 'path';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import external from 'rollup-plugin-peer-deps-external';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import sourcemaps from 'rollup-plugin-sourcemaps';

const name = 'index';
const umdName = 'ReactHookForm';

export function createRollupConfig(options) {
  const shouldMinify = options.minify || options.env === 'production';
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
    shouldMinify ? 'min' : '',
    'js',
  ]
    .filter(Boolean)
    .join('.');

  return {
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
      options.env !== undefined &&
        replace({
          'process.env.NODE_ENV': JSON.stringify(options.env),
        }),
      sourcemaps(),
      shouldMinify && compiler(),
      options.plugins,
    ],
  };
}
