/* eslint-disable @typescript-eslint/no-require-imports */
const config = require('./jest.config');

// Tests that still fail with React Compiler. Remove an entry once it passes.
const knownFailures = [
  'FormStateSubscribe should not re-render when a non-subscribed field changes',
  'FormStateSubscribe should not re-render when subscribed field name is not included',
  'React Compiler compatibility should refresh read methods called on the useForm return value',
  'useController should listen to similar fields with exact - false',
  'useController should only subscribe to formState at each useController level',
  'useController should subscribe to exact form state update',
  'useFieldArray with should unregister true should keep the shifted nested field array when a previous row is removed with shouldUnregister',
  'append with resolver should not invoke resolver per register during append; only array-scoped + final isValid',
  'useFieldArray dirtyFields isolation should revalidate dirty fields when dirty flag is not match field level dirty',
  'insert should not invoke resolver per register during insert; only array-scoped + final isValid',
  'prepend with resolver should not invoke resolver per register during prepend; only array-scoped + final isValid',
  'remove should drop dirty state for removed rows so a re-added row matching defaults is pristine',
  'replace with resolver should not invoke resolver per register during replace, but run after replace completes',
  'update with resolver should not invoke resolver per register during update; only array-scoped + final isValid',
  'formState isValid should not let a stale resolver pass report isValidating as false while a newer one is pending',
  'reset should keep a newer onChange validation marked as validating when a stale resolver from before reset settles',
  'resetField should clear stale validating state when reset does not revalidate',
  'trigger should only trigger render on targeted input',
  'unregister should recompute isValidating after unregistering a field with a pending validation',
  'useFormState should not re-render when subscribed field name is not included',
  'useFormState should only re-render when subscribed field names updated',
  'useWatch fieldArray should return shallow merged watch values',
  'useWatch fieldArray with shouldUnregister true should watch correct input update with single field array input',
  'Watch should trigger re-render only when the values corresponding to the `name` prop change',
];

const escape = (name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  ...config,
  // Jest can't exclude tests by name, so skip them with a negative lookahead.
  testNamePattern: `^(?!(${knownFailures.map(escape).join('|')})$)`,
  projects: config.projects.map((project) => ({
    ...project,
    transform: {
      ...project.transform,
      '^.+\\.tsx?$': 'babel-jest',
    },
  })),
};
