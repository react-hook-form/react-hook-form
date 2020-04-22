import { getConfig } from './rollup.config';
import replace from 'rollup-plugin-replace';
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
      file: `dist/${pkg.name}.umd.js`,
      format: 'umd',
      globals: {
        react: 'React',
      },
    },
  ],
});
