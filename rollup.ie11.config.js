import { getConfig } from './rollup.config';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  output: pkg => [
    {
      file: `dist/${pkg.name}.ie11.js`,
      exports: 'named',
      format: 'cjs',
    },
  ],
});
