import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import packageJson from './package.json';

const outputConfig = pkg => [
  {
    file: `dist/${pkg.name}.js`,
    exports: 'named',
    format: 'cjs',
  },
  {
    file: `dist/${pkg.name}.es.js`,
    exports: 'named',
    format: 'es',
  },
];

export function getConfig({
  tsconfig = './tsconfig.json',
  output = outputConfig,
} = {}) {
  return {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    // export: 'named',
    plugins: [
      typescript({
        tsconfig,
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

    output: output(packageJson),
  };
}

export default getConfig();
