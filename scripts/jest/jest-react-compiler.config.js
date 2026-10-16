/* eslint-disable @typescript-eslint/no-require-imports */
const config = require('./jest.config');

// Tests that still fail with React Compiler. Remove an entry once it passes.
const knownFailures = [
  'FormProvider expose resetDefaultValues from useFormContext',
  'FormProvider expose setValues from useFormContext',
  'FormProvider not do unnecessary rerenders by useFormContext',
  'FormProvider report errors correctly',
  'FormProvider report errors correctly with useFieldArray Controller',
  'update error state in FormProvider when setError is called in useEffect',
  'FormStateSubscribe not re-render when a non-subscribed field changes',
  'FormStateSubscribe not re-render when subscribed field name is not included',
  'React Compiler compatibility should refresh read methods called on the useForm return value',
  'useController listen to similar fields with exact - false',
  'useController only subscribe to formState at each useController level',
  'useController subscribe to exact form state update',
  'useFieldArray with should unregister true keep the shifted nested field array when a previous row is removed with shouldUnregister',
  'append with resolver not invoke resolver per register during append; only array-scoped + final isValid',
  'useFieldArray dirtyFields isolation revalidate dirty fields when dirty flag is not match field level dirty',
  'insert not invoke resolver per register during insert; only array-scoped + final isValid',
  'prepend with resolver not invoke resolver per register during prepend; only array-scoped + final isValid',
  'remove drop dirty state for removed rows so a re-added row matching defaults is pristine',
  'replace with resolver not invoke resolver per register during replace, but run after replace completes',
  'update with resolver not invoke resolver per register during update; only array-scoped + final isValid',
  'formState isValid not let a stale resolver pass report isValidating as false while a newer one is pending',
  'reset keep a newer onChange validation marked as validating when a stale resolver from before reset settles',
  'resetField clear stale validating state when reset does not revalidate',
  'trigger only trigger render on targeted input',
  'unregister recompute isValidating after unregistering a field with a pending validation',
  'useFormState not re-render when subscribed field name is not included',
  'useFormState only re-render when subscribed field names updated',
  'useWatch fieldArray return shallow merged watch values',
  'useWatch fieldArray with shouldUnregister true watch correct input update with single field array input',
  'Watch trigger re-render only when the values corresponding to the `name` prop change',
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
