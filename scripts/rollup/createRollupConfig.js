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
