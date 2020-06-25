import { getConfig } from './rollup.config';
import replace from '@rollup/plugin-replace';
import pkg from '../package.json';

export default getConfig({
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
  output: [
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
