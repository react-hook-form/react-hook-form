import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  external: ['react', 'react-dom'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.ie11.json',
    }),
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
      file: 'dist/react-hook-form.ie11.js',
      format: 'cjs',
    },
  ],
};
