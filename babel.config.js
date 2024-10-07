module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'babel-plugin-react-compiler',
      {
        runtimeModule: 'react-compiler-runtime-polyfill',
        sources: (filename) => {
          return filename.includes('__tests__');
        },
      },
    ],
  ],
};
