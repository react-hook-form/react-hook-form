import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import pkg from '../../package.json';

/**
 *
 * @returns {import("rollup").RollupOptions}
 */
export function createRollupConfig(options, callback) {
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
          ecma: 2020,
          output: { comments: false },
          compress: {
            drop_console: true,
            passes: 4,
            toplevel: true,
            unsafe_arrows: true,
            unsafe_methods: true,
            unsafe: false,
            unsafe_comps: false,
            unsafe_math: false,
            booleans_as_integers: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
          },
        }),
    ].filter(Boolean),
  };

  return callback ? callback(config) : config;
}
