import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export function getConfig() {
  return {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    plugins: [
      typescript({
        clean: true,
      }),
      terser({
        warnings: true,
        mangle: {
          properties: {
            regex: /^__/,
          },
        },
      }),
    ],
    output: [
      {
        file: `dist/${pkg.name}.js`,
        format: 'cjs',
      },
      {
        file: `dist/${pkg.name}.es.js`,
        format: 'es',
      },
    ],
  };
}

export default getConfig();
