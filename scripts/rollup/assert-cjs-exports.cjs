/**
 * This file, when executed in the postbuild lifecycle, ensures that
 * the CJS output is valid CJS according to the package.json spec.
 *
 * @see https://nodejs.org/docs/latest/api/packages.html#packages_determining_module_system
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const exported = require('react-hook-form');
const assert = require('assert');
const fs = require('fs');

/**
 * When this fails, fine the update one-liner in ./assert-esm-exports.mjs
 */
const expected = JSON.parse(
  fs.readFileSync(
    require('path').resolve(__dirname, './all-exports.json'),
    'utf-8',
  ),
);

const methods = Object.keys(exported);

assert.equal(expected.length, Object.keys(exported).length);

expected.forEach((name) => {
  assert(!!methods.includes(name));
});
