import { getConfig } from './rollup.config';
import pkg from './package.json';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  output: [
    {
      file: `dist/${pkg.name}.ie11.js`,
      format: 'cjs',
    },
  ],
});
