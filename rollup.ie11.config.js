import { getConfig } from './rollup.config';
import packageJson from './package.json';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  output: [
    {
      file: `dist/${packageJson.name}.ie11.js`,
      exports: 'named',
      format: 'cjs',
    },
  ],
});
