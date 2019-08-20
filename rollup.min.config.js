import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  plugins: [typescript(), terser()],
  external: ['react', 'react-dom'],
  output: [
    {
      file: 'dist/react-hook-form.min.es.js',
      format: 'es',
    },
  ],
};
