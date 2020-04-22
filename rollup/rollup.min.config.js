import { getConfig } from './rollup.config';
import { terser } from 'rollup-plugin-terser';
import pkg from '../package.json';

export default getConfig({
  plugins: [terser()],
  output: [
    {
      file: `dist/${pkg.name}.min.es.js`,
      format: 'es',
    },
  ],
});
