import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  plugins: [typescript()],
  external: ['react', 'react-dom'],
  output: [
    {
      file: 'dist/react-hook-form.js',
      format: 'cjs',
    },
    {
      file: 'dist/react-hook-form.es.js',
      format: 'es',
    },
  ],
};
