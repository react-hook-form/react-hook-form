import { getConfig } from './rollup.config';
import pkg from './package.json';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  input: 'src/index.ie11.ts',
  output: [
    {
      file: `dist/${pkg.name}.ie11.js`,
      format: 'cjs',
      exports: 'named',
    },
  ],
  external: ['react', 'react-dom', 'ts-polyfill', 'ts-polyfill/es2015-iterable', 'ts-polyfill/es2015-symbol', 'ts-polyfill/es2015-symbol-wellknown']
});
