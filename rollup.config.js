import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  plugins: [
    typescript(),
  ],
  external: ['react', 'react-flip-numbers', 'react-simple-animate'],
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.es.js',
      format: 'es',
    },
  ],
};
