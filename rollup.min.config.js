import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import packageJson from './package.json';

export default {
  input: 'src/index.ts',
  plugins: [
    typescript({
      clean: true,
    }),
    terser(),
  ],
  external: ['react', 'react-dom'],
  output: [
    {
      file: `dist/${packageJson.name}.min.es.js`,
      format: 'es',
    },
  ],
};
