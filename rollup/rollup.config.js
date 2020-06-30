import external from 'rollup-plugin-peer-deps-external';
import typescript from 'rollup-plugin-typescript2';
import sourcemaps from 'rollup-plugin-sourcemaps';
import pkg from '../package.json';

export const getConfig = ({
  tsconfig = './tsconfig.json',
  output = [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins = [],
} = {}) => ({
  input: 'src/index.ts',
  plugins: [
    external(),
    typescript({
      tsconfig,
      clean: true,
    }),
    sourcemaps(),
    ...plugins,
  ],
  output,
});

export default getConfig();
