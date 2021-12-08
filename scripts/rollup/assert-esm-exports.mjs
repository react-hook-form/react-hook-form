/**
 * This file, when executed in the postbuild lifecycle, ensures that
 * the ESM output is valid ESM according to the package.json spec.
 *
 * @see https://nodejs.org/docs/latest/api/packages.html#packages_determining_module_system
 */
import * as exported from 'react-hook-form';
import assert from 'assert';

/**
 * A shell one-liner to update this array when neccessary:
 *
 *  node -e "import('react-hook-form').then((mod) => console.dir(Object.keys(mod)))"
 */
assert.deepStrictEqual(Object.keys(exported), [
  'Controller',
  'FormProvider',
  'appendErrors',
  'get',
  'set',
  'useController',
  'useFieldArray',
  'useForm',
  'useFormContext',
  'useFormState',
  'useWatch',
]);
