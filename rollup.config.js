import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export function getConfig({
  tsconfig = './tsconfig.json',
  input = 'src/index.ts',
  output = [
    {
      file: `dist/${pkg.name}.js`,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: `dist/${pkg.name}.es.js`,
      format: 'esm',
    },
  ],
  external = ['react', 'react-dom']
} = {}) {
  return {
    input: input,
    external: external,
    plugins: [
      typescript({
        tsconfig,
        clean: true,
      }),
    ],
    output,
  };
}

export default getConfig();
