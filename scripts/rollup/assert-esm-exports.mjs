/**
 * This file, when executed in the postbuild lifecycle, ensures that
 * the ESM output is valid ESM according to the package.json spec.
 *
 * @see https://nodejs.org/docs/latest/api/packages.html#packages_determining_module_system
 */
import * as exported from 'react-hook-form';
import assert from 'assert';
import fs from 'fs';

/**
 * A shell one-liner to update this array when neccessary (run from root of repo):
 *  node -e "import('react-hook-form').then((mod) => console.log(JSON.stringify(Object.keys(mod), null, 2)))" > scripts/rollup/all-exports.json
 */
const expected = JSON.parse(
  fs.readFileSync(
    new URL('./all-exports.json', import.meta.url).pathname,
    'utf-8',
  ),
);

assert.deepStrictEqual(Object.keys(exported), expected);
