import typescript from 'rollup-plugin-typescript2';
import packageJson from './package.json';

export function getConfig() {
  return {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    plugins: [
      typescript({
        clean: true,
      }),
    ],
    output: [
      {
        file: `dist/${packageJson.name}.js`,
        format: 'cjs',
      },
      {
        file: `dist/${packageJson.name}.es.js`,
        format: 'es',
      },
    ],
  };
}

export default getConfig();
