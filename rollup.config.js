import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export function getConfig({
  tsconfig = './tsconfig.json',
  output = [
    {
      file: `dist/${pkg.name}.js`,
      format: 'cjs',
    },
    {
      file: `dist/${pkg.name}.es.js`,
      format: 'esm',
    },
  ],
} = {}) {
  return {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
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
