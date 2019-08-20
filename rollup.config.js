import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
  plugins: [
    typescript(),
    terser({
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
  ],

  output: [
    {
      file: 'dist/react-hook-form.js',
      format: 'cjs',
    },
    {
      file: 'dist/react-hook-form.es.js',
      format: 'esm',
    },
  ],
};
