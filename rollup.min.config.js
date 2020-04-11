import typescript from 'rollup-plugin-typescript2';
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  plugins: [
    typescript(),
    compiler(),
    terser(),
    cleanup(),
  ],
  external: ['react'],
  output: [
    {
      file: 'dist/react-hook-form.min.es.js',
      format: 'es',
    },
  ],
};
