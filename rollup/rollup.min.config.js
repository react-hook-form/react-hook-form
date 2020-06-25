import { getConfig } from './rollup.config';
import { terser } from 'rollup-plugin-terser';
import pkg from '../package.json';

export default getConfig({
  plugins: [terser()],
  output: [
    {
      file: pkg['module:min'],
      format: 'es',
    },
    {
      name: 'ReactHookForm',
      file: pkg['umd:main'],
      format: 'umd',
      globals: {
        react: 'React',
      },
    },
  ],
});
