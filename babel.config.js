module.exports = {
  presets: [
    // Keep async functions native: hasPromiseValidation checks for AsyncFunction.
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'babel-plugin-react-compiler',
      {
        target: '18',
        // Outlined callbacks move to module scope and lose variables declared in
        // the test body, which throws `ReferenceError` in compiled tests.
        environment: { enableFunctionOutlining: false },
        sources: (filename) => {
          return filename.includes('__tests__');
        },
      },
    ],
  ],
};
