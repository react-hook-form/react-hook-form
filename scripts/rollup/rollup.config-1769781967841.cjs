'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pkg = require('../../package.json');
var commonjs = require('@rollup/plugin-commonjs');
var terser = require('@rollup/plugin-terser');
var typescript = require('rollup-plugin-typescript2');

/**
 *
 * @returns {import("rollup").RollupOptions}
 */
function createRollupConfig(options, callback) {
  const name = options.name;
  // A file with the extension ".mjs" will always be treated as ESM, even when pkg.type is "commonjs" (the default)
  // https://nodejs.org/docs/latest/api/packages.html#packages_determining_module_system
  const extName = options.format === 'esm' ? 'mjs' : 'js';
  const outputName = 'dist/' + [name, options.format, extName].join('.');

  const config = {
    input: options.input,
    output: {
      file: outputName,
      format: options.format,
      name: 'ReactHookForm',
      sourcemap: true,
      globals: { react: 'React' },
      exports: 'named',
    },
    external: Object.keys(pkg.peerDependencies),
    plugins: [
      typescript({
        clean: true,
      }),
      options.format === 'umd' &&
        commonjs({
          include: /\/node_modules\//,
        }),
      options.format !== 'esm' &&
        terser({
          output: { comments: false },
          compress: {
            drop_console: true,
            passes: 2,
            unsafe: false,
            unsafe_comps: false,
            unsafe_math: false,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
          },
        }),
    ].filter(Boolean),
  };

  return callback ? callback(config) : config;
}

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
];

var rollup_config = options.map((option) => createRollupConfig(option));

exports.default = rollup_config;
