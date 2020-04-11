import typescript from 'rollup-plugin-typescript2';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import cleanup from 'rollup-plugin-cleanup';
import pkg from './package.json';

export function getConfig({
  tsconfig = './tsconfig.json',
  output = [
    {
      file: `dist/${pkg.name}.js`,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: `dist/${pkg.name}.es.js`,
      format: 'esm',
      sourcemap: true,
    },
    {
      name: 'ReactHookForm',
      file: `dist/${pkg.name}.umd.js`,
      format: 'umd',
      globals: {
        react: 'React',
      },
      sourcemap: true,
    },
  ],
} = {}) {
  return {
    input: 'src/index.ts',
    external: ['react'],
    plugins: [
      typescript({
        tsconfig,
      }),
      compiler(),
      cleanup()
    ],
    output,
  };
}

export default getConfig();
