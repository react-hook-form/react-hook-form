import typescript from 'rollup-plugin-typescript2';
import compiler from "@ampproject/rollup-plugin-closure-compiler";

export default {
  tsconfig: './tsconfig.json',
  input: 'src/index.ts',
  plugins: [
    typescript({
      tsconfig,
    }),
    compiler(),
  ],
  external: ['react'],
  output: [
    {
      file: 'dist/react-hook-form.min.es.js',
      format: 'es',
    },
  ],
};
