/* eslint-disable @typescript-eslint/no-var-requires */
const ts = require('typescript');
const fs = require('fs-extra');
const path = require('path');
const pkg = require('../../package.json');

function writeCjsEntryFile(
  name = pkg.name,
  formatName = 'cjs',
  tsconfig = 'tsconfig.json',
) {
  const baseLine = `module.exports = require('./${name}`;
  const contents = `
'use strict'

if (process.env.NODE_ENV === 'production') {
  ${baseLine}.${formatName}.production.min.js')
} else {
  ${baseLine}.${formatName}.development.js')
}
`;

  const tsconfigJSON = ts.readConfigFile(tsconfig, ts.sys.readFile).config;
  const tsCompilerOptions = ts.parseJsonConfigFileContent(
    tsconfigJSON,
    ts.sys,
    './',
  ).options;

  const filename =
    formatName === 'cjs'
      ? [name, 'js'].join('.')
      : [name, formatName, 'js'].join('.');

  return fs.outputFile(path.join(tsCompilerOptions.outDir, filename), contents);
}

writeCjsEntryFile('index');
writeCjsEntryFile('index', 'ie11', 'tsconfig.ie11.json');
