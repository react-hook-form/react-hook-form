import typescript from 'rollup-plugin-typescript2';
import pkg from '../package.json';

export function getConfig({
  tsconfig = './tsconfig.json',
  output = [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: pkg.module,
      format: 'esm',
    },
  ],
  plugins = [],
} = {}) {
  return {
    input: 'src/index.ts',
    external: ['react'],
    plugins: [
      typescript({
        tsconfig,
        clean: true,
      }),
      ...plugins,
    ],
    output,
  };
}

export default getConfig();
