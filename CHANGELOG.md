# Changelog

## [7.16.0] - 2021-09-25

## Added

- `register` allowed pass custom `onChange` and `onBlur`

```tsx
<input
  type="text"
  {...register('test', {
    onChange: (e) => {},
    onBlur: (e) => {},
  })}
/>
```

## [7.15.0] - 2021-09-05

## Added

- `useFieldArray` new method `replace()`

```tsx
const { control } = useForm({
  defaultValues: {
    test: [{ value: 'lorem' }, { value: 'ipsum' }],
  },
});
const { fields, replace } = useFieldArray({
  control,
  name: 'test',
});

const handleFullyReplacement = (): void => {
  // remove old and set fully new values
  replace([{ value: 'dolor' }, { value: 'sit' }, { value: 'amet' }]);
};
```

## [7.14.0] - 2021-08-27

## Added

- `register` add dependent validation

```tsx
const App = () => {
  const { register, getValues } = useForm();

  return (
    <form>
      <input
        {...register('firstName', {
          validate: (value) => {
            return getValues('lastName') === value;
          },
        })}
      />
      <input {...register('lastName', { deps: ['firstName'] })} /> // dependant validation
    </form>
  );
};
```

## [7.13.0] - 2021-08-22

## Added

`Trigger`

- Trigger will enable object name trigger and field array name trigger

```tsx
useFieldArray({ name: 'test' });

trigger('name'); // will trigger the whole field array to validate
```

`register`

- added a `disabled` prop as an option to toggle input disable attribute
- register will be able to seek input DOM reference through the `ref` callback

```tsx
register('test', { disabled: true }) // will set value to undefined and pass disabled down to the input attribute

<div {...register('test')}>
  <input name="test" /> // this input will be registered
</div>
```

`useWatch`

- added `disabled` prop to toggle the state subscription.

```tsx
useWatch({ disabled: true }); // you toggle the subscription
```

`useFormState`

- added `disabled` prop to toggle the state subscription.

```tsx
useFormState({ disabled: true }); // you toggle the subscription
```

`setValue`

- allow set value for non-registered inputs include nested object and array field.

```tsx
<input {...register('test.0.firstName')} />

setValue('test', [{ firstName: 'bill' }, {firstName: 'kotaro}, {firstName: 'joris'}]) // this will works
```

## [7.12.0] - 2021-07-24

## Added

- new `useForm` config `delayError`

```tsx
useForm({
  delayError: 500, // delay error appear with 500ms
});
```

## [7.11.0] - 2021-07-13

## Added

- `update` method to update an field array inputs

```tsx
const { update } = useFieldArray();

update(0, data); // update an individual field array node
```

## [7.10.0] - 2021-07-02

## Changed

- `defaultValue` is no longer a required prop for register input with `useFieldArray`

## [7.9.0] - 2021-06-19

## Added

- new config at `useForm` to enabled native browser validation

```tsx
const { register, handleSubmit } = useForm({
  shouldUseNativeValidation: true,
});
```

## [7.8.5] - 2021-06-15

### Change

- `useController` no longer access input `ref` except `focus` event for focus management

## [7.8.0] - 2021-06-5

### Added

- `setValue` support `shouldTouch` to update formState touchFields

```tsx
setValue('firstName', 'value', { shouldTouch: true });
```

- `register` now accept `value` as option

```tsx
register('firstName', { value: 'value' });
```

## Changed

- `isValid` will initialise as `false`

## [7.7.1] - 2021-05-30

### Fixed

- `shouldUnregister: false` should not shallow merge or register absent input fields from `defaultValues`

## [7.7.0] - 2021-05-29

### Added

- `trigger` support focus with error input

```ts
trigger('inputName', { shouldFocus: true });
```

### Changed

- `handleSubmit` will `throw` error within the onSubmit callback

## [7.6.0] - 2021-05-15

### Changed

- `useForm` will `register` missing inputs from `defaultValues`

```tsx
const App = () => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      test: { firstName: 'bill', lastName: 'luo' },
    },
  });

  const onSubmit = (data) => {
    // missing registered input will be included
    console.log(data); // { test: { firstName: 'bill', lastName: 'luo' } }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('test.firstName')} />
      <button />
    </form>
  );
};
```

## [7.5.0] - 2021-05-09

### Changed

- `isSubmitSuccessful` will return false when `handleSubmit` callback failed with `Error` or `Promise` reject.
- unmounted input will no longer get validated even with `shouldUnregister: false`

## [7.4.0] - 2021-05-04

### Added

- new `name` prop for `useFormState` to subscribe to individual inputs.

```ts
useFormState({
  name: 'inputName', // optional and can be array of inputs' name as well
});
```

## [7.2.2] - 2021-04-21

### Changes

- set `shouldUnregister` to `true` will not shallow merge `defaultValues`

## [7.2.0] - 2021-04-19

### Changes

- `shouldUnregister` config to remove input value after unmount

```tsx
// Global config (can't be overwrite)
useForm({
  shouldUnregister: true // default to false
})

// Component/Hook level config (can not overwrites global config)
register('test', {
  shouldUnregister: true // default to false
})

<Controller  shouldUnregister={true} />

useController({ shouldUnregister: true })

useFieldArray({ shouldUnregister: true })
```

## [7.0.6] - 2021-04-12

### Changes

- `register` will retrieve `onChange`'s target value when component'ref is not a valid input element.

## [7.0.0-rc.7] - 2021-03-28

### Changes

- change type name from `RefCallbackHandler` to `UseFormRegisterReturn` for register callback's return

## [7.0.0-rc.7] - 2021-03-23

### Changes

- `useFieldArray` will produce an empty array `[]` when no field is presented.

## [7.0.0-rc.1] - 2021-03-08

### Changes

- `setValue` with field array will `register` all inputs before rendering.

## [7.0.0-beta.17] - 2021-03-03

### Changes

- `append`, `prepend` and `insert` will `register` deeply nested inputs at `useFieldArray`.

## [7.0.0-beta.15] - 2021-02-27

### Changes

- typescript array index restriction removed.
- `append`, `prepend` and `insert` will `register` inputs during each action at `useFieldArray`.

## [7.0.0-beta.11] - 2021-02-20

### Changes

- change `ArrayKey` type to `number | '${number}'`

## [7.0.0-beta.10] - 2021-02-19

### Changes

- Change `useController`'s `meta` into `fieldState` and include `formState`, these change will be applied to `Controller` too.

```diff
- const { field, meta } = useController({ control });
+ const { field, fieldState, formState } = useController({ control });
```

## [7.0.0-beta.9] - 2021-02-19

### Changes

- typescript array index support is changed to `49` instead of `99`

## [7.0.0-beta.4] - 2021-02-08

- **Breaking change:** `valueAs` will be run before the built-in validation and `resolver`

```diff
- <input {...register('test', { validate: (data: string) => {}, valueAsNumber: true })} />
+ <input {...register('test', { validate: (data: number) => {}, valueAsNumber: true })} />
```

## [7.0.0-beta.1] - 2021-02-08

### Changes

- `useWatch` will no longer required `defaultValue` for field Array

## [7.0.0-beta.0] - 2021-02-06

### Changes

- **Breaking change:** shallow merge defaultValues with result (#4074)

```ts
useForm({ defaultValues: { test: 'test' } });

getValues(); // v6 will return {}
getValues(); // v7 will return { test: 'test' }
```

## [v7.0.0-alpha.2] - 2021-02-04

### Changes

- **Breaking change:** `setError`'s `shouldFocus` option has been moved into the third argument.

```diff
- setError('test', { type: 'type', message: 'issue', shouldFocus: true })
+ setError('test', { type: 'type', message: 'issue' }, { shouldFocus: true })
```

- **Breaking change:** type name changes:

```diff
- UseFormMethods
+ UseFormReturn
- UseFormOptions
+ UseFormProps
- UseFieldArrayMethods
+ UseFieldArrayReturn
- UseFieldArrayOptions
+ UseFieldArrayProps
- UseControllerMethods
+ UseControllerReturn
- UseControllerOptions
+ UseControllerProps
- ArrayField
+ FieldArray
```

### Fixes

- fix `setValue` with `Controller` and `reset` with `useFieldArray` issues: 4111 & 4108 (#4113)

## [v7.0.0-alpha.2] - 2021-02-02

### Changes

- **Breaking change:** `setError`'s `shouldFocus` option has been moved to the third argument.

```diff
- setError('test', { type: 'type', message: 'issue', shouldFocus: true })
+ setError('test', { type: 'type', message: 'issue' }, { shouldFocus: true })
```

### Fixes

- fix #4078 issue with watch + mode: onChange

### Improvements

- remove internal deep clone (#4088)
- remove transformToNestObject (#4089)

## [v7.0.0-alpha.1] - 2021-02-01

### Changes

- field name reference will be removed with `unregister` (#4010)

- **Breaking change:** improve field array remove result and no longer remove field array value after unmount

```diff
const { remove } = useFieldArray({ name: 'test' })
remove();
getValues(); // V6: result form value {}
getValues(); // V7: result form value { test: [] }
```

### Improvements

- change internal field names into `Set` (#4015)
- improve `onChange` perf with `resolver (#4017)
- improve field array name look up perf (#4030)

## [v7.0.0-alpha.0] - 2021-01-31

### Added

- new custom hook `useFormState` (#3740)

```ts
const { isDirty, errors } = useFormState();
```

- `watch` support can subscribe to the entire form with a callback

```ts
watch((data, { name, type }) => {
  console.log('formValue', data);
  console.log('name', name);
  console.log('type', type);
});
```

- `useController` includes new `isValidating` state (#3778)
- `useController` includes new `error` state (#3921)

```ts
const {
  meta: { error, isValidating },
} = useController({ name: 'test' });
```

- new `unregister` second argument (#3964)

```ts
unregister('test', { keepDirty: true });
```

- Resolver add `field` being validated (#3881)

```diff
- resolver: (values: any, context?: object) => Promise<ResolverResult> | ResolverResult
+ resolver: (
+    values: any,
+    context?: object,
+    options: {
+       criteriaMode?: 'firstError' | 'all',
+       names?: string[],
+       fields: { [name]: field } // Support nested field
+    }
+  ) => Promise<ResolverResult> | ResolverResult
```

- `useFieldArray` action can focus input by name and index

```ts
append(object, config: { shouldDirty: boolean, focusIndex: number, focusName: string })
insert(object, config: { shouldDirty: boolean, focusIndex: number, focusName: string })
prepend(object, config: { shouldDirty: boolean, focusIndex: number, focusName: string })
```

### Changes

- **Breaking change:** No longer support IE 11 support

- **Breaking change:** `register` has been changed from register at `ref` to a function which needs to be spread as props.

```diff
- <input ref={register, { required: true }} name="test" />
+ <input {...register('name', { required: true })} />
+ <TextInput {...register('name', { required: true })} />
```

- **Breaking change:** `name` with array will only support dot syntax instead of brackets.

```
- test[2].test
+ test.2.test
```

- **Breaking change:** remove `as` prop at `Controller` and fix render prop consistency (#3732)

```diff
- <Controller render={props => <input {...props} />} />
+ <Controller render={({ field }) => <input {...field} />} />
```

- **Breaking change:** remove `errors` alias (#3737)

```diff
- const { errors } = useForm();
+ const { formState: { errors } } = useForm();
```

- **Breaking change:** improved `reset` second argument (#3905)

```diff
- reset({}, { isDirty: true })
+ reset({}, { keepIsDirty: true })
```

- **Breaking change:** change `touched` to `touchedFields` for consistency (#3923)

```diff
- const { formState: { touched } } = useForm();
+ const { formState: { touchedFields }} = useForm();
```

- **Breaking change:** `trigger` will no longer return validation result.

```diff
- await trigger('test') // return true or false
+ trigger('test') // void
```

- remove `isSubmitting` proxy (#4000)

- input `register` will no longer be removed due to unmount, user will have to manually invoke `unregister`

### Improvements

- `useWatch` internal mechanism improvement (#3754)
- `Controller` and `useController` apply `useFormState` internally and improve performance (#3778)
- `register` type support for input name (#3738)
- `Controller` and `useCOntroller` type support for input name (#3738)
- `useFieldArray` internal logic and data structure improvement (#3858)
- improve `useFieldArray` internal fields update with subscription (#3943)
- improve tests structure (#3916)
- `useWatch` type improvement (#3931)
- improve type support for nested field array with `const` (#3920)
- improve `useFieldArray` internal type structure (#3986)
- `MutationObserver` removed from `useForm`

## [6.15.0] - 2021-02-02

### Changed

- radio input default selection will return `null` instead of empty string `''`
- `valueAsNumber` with empty input will return `NaN` instead of `0`

## [6.14.0] - 2020-12-31

### Changed

- `setValue` without shouldUnregister:false will no longer deep clone its value instead with shallow clone

### Added

- new formState `isValidating`, this will set to `true` during validation.

```ts
const {
  formState: { isValidating },
} = useForm();
```

## [6.12.0] - 2020-12-12

### Changed

- When invoking `reset({ value })` value will be shallow clone value object which you have supplied instead of deepClone.

```tsx
// ❌ avoid the following with deep nested default values
const defaultValues = { object: { deepNest: { file: new File() } } };
useForm({ defaultValues });
reset(defaultValues); // share the same reference

// ✅ it's safer with the following, as we only doing shallow clone with defaultValues
useForm({ deepNest: { file: new File() } });
reset({ deepNest: { file: new File() } });
```

### Added

- New custom hook `useController`: This custom hook is what powers Controller, and shares the same props and methods as Controller. It's useful to create reusable Controlled input, while Controller is the flexible option to drop into your page or form.

```tsx
import React from 'react';
import { TextField } from '@material-ui/core';
import { useController } from 'react-hook-form';

function Input({ control, name }) {
  const {
    field: { ref, ...inputProps },
    meta: { invalid, isTouched, isDirty },
  } = useController({
    name,
    control,
    rules: { required: true },
    defaultValue: '',
  });

  return <TextField {...inputProps} inputRef={ref} />;
}
```

## [6.12.0] - 2020-11-28

### Changed

- `useWatch` will retrieve the latest value from `reset(data)` instead of return `defaultValue`

```tsx
useWatch({
  name: 'test',
  defaultValue: 'data', // this value will only show on the initial render
});
```

- TS: name changed from `ValidationRules` to `RegisterOptions` due to valueAs functionality included as `register` function.

### Added

- `register` function with additional options to transform value

  - `valueAsDate`
  - `valueAsNumber`
  - `setValue`

```tsx
register({
  valueAsNumber: true,
});

register({
  valueAsNumber: true,
});

register({
  setValueAs: (value) => value,
});
```

### Added

## [6.11.0] - 2020-11-07

### Changed

- `defaultValues` is **required** to measure `isDirty`, keep a single source of truth to avoid multiple issues raised around `isDirty`
- when `watch` with `useFieldArray`, `fields` object is no longer required as defaultValue

```diff
- watch('fieldArray', fields);
+ watch('fieldArray');
```

## [6.10.0] - 2020-10-31

### Added

- `Controller` will have an extra `ref` props to improve DX in terms of focus management.

```tsx
<Controller
  name="test"
  render={(props) => {
    return (
      <input
        value={props.value}
        onChange={props.onChange}
        ref={props.ref} // you can assign ref now without the use of `onFocus`
      />
    );
  }}
/>

// focus will work correct without the `onFocus` prop
<Controller name="test" as={<input />} />
```

### Changed

- `resolver` with group error object will no longer need with `trigger` to show and clear error. This minor version made hook form look at parent error node to detect if there is any group error to show and hide.

```tsx
const schema = z.object({
  items: z.array(z.boolean()).refine((items) => items.some((item) => item)),
});

{
  items.map((flag, index) => (
    <input
      type="checkbox"
      defaultChecked={false}
      // onChange={() => trigger("items")} now can be removed
      ref={register}
      name={`items.${index}`}
    />
  ));
}
```

## [6.9.0] - 2020-10-3

### Changed

- with shouldUnregister set to false, empty Field Array will default [] as submission result.

```tsx
const { handleSubmit } = useForm({
  shouldUnregister: false,
});

useFieldArray({
  name: 'test',
});

handleSubmit((data) => {
  // shouldUnregister: false
  // result:  { data: {test: []} }
  // shouldUnregister: true
  // result: {}
});
```

## [6.8.4] - 2020-09-22

### Changed

- when input unmounts `touched` and `dirtyFields` will no longer get removed from `formState` (shouldUnregister: true).

## [6.8.0] - 2020-09-09

### Added

- new formState `isSubmitSuccessful` to indicate successful submission
- `setError` now support focus on the actual input

```typescript jsx
setError('test', { message: 'This is required', shouldFocus: true });
```

### Changed

- with `shouldUnregister:false` `defaultValues` data will be part of the submission data
- with `shouldUnregister:false` conditional field is going to work with `useFieldArray`
- `setValue` now support `useFieldArray`

```diff
- setValue('test', 'data')
+ setValue('test', [{ test: '123' }]) // make it work for useFieldArray and target a field array key
```

- remove `exact` config at clearErrors

```diff
- clearErrors('test', { exact: false })
+ clearErrors('test') // does it automatically in the lib
```

## [6.7.0] - 2020-08-30

### Added

- `clearError` have second option argument for clear errors which are exact or key name

```ts
register('test.firstName', { required: true });
register('test.lastName', { required: true });
clearErrors('test', { exact: false }); // will clear both errors from test.firstName and test.lastName
clearErrors('test.firstName'); // for clear single input error
```

## [6.6.0] - 2020-08-28

### Changed

- all types from this lib has been exported. **Important:** only documented type: https://react-hook-form.com/ts will avoid breaking change.

## [6.5.0] - 2020-08-23

### Changed

- `errors` is also part of `formState` object
- `disabled` input will not be part of the submission data by following the [HTML standard](https://html.spec.whatwg.org/multipage/forms.html#constructing-the-form-data-set)

## [6.4.0] - 2020-08-15

### Added

- `Controller`'s `render` prop will pass down `name` prop
- `handleSubmit` take a second callback for errors callback
- new mode `onTouched` will only trigger validation after inputs are touched

### Changed

- `register` no longer compare `ref` difference with React Native

## [6.3.2] - 2020-08-11

### Changed

- IE 11 version will be required to install `@babel/runtime-corejs3` as dependency at your own project

## [6.3.0] - 2020-08-8

### Changed

- `defaultValue` is become **required** for `useFieldArray` at each input

## [6.2.0] - 2020-07-30

### Changed

- revert `getValues` will return default values before inputs registration

## [6.1.0] - 2020-07-26

### Changed

- `resolver` supports both async and sync
- `getValues` will return default values before inputs registration

## [6.0.7] - 2020-07-17

### Added

- export `ArrayField` type

### Changed

- error message will support array of messages for specific type

```diff
- export type ValidateResult = Message | boolean | undefined;
+ export type ValidateResult = Message | Message[] | boolean | undefined;
```

## [6.0.3] - 2020-07-10

### Changed

- Controller `onFocus` works with React Native
- Controller stop producing `checked` prop by boolean `value`

## [6.0.2] - 2020-07-8

### Added

- export `UseFormOptions`, `UseFieldArrayOptions`, `FieldError`, `Field` and `Mode` type

## [6.0.1] - 2020-07-3

### Added

- export `ValidationRules` type

## [6.0.0] - 2020-07-1

### Added

- config for `shouldUnregister` which allow input to be persist even after unmount

```typescript
useForm({
  shouldUnregister: false, // unmount input state will be remained
});
```

- auto focus with useFieldArray

```ts
append({}, (autoFocus = true));
prepend({}, (autoFocus = true));
insert({}, (autoFocus = true));
```

- TS: NestedValue

```tsx
import { useForm, NestedValue } from 'react-hook-form';

type FormValues = {
  key1: string;
  key2: number;
  key3: NestedValue<{
    key1: string;
    key2: number;
  }>;
  key4: NestedValue<string[]>;
};

const { errors } = useForm<FormValues>();

errors?.key1?.message; // no type error
errors?.key2?.message; // no type error
errors?.key3?.message; // no type error
errors?.key4?.message; // no type error
```

- `useWatch` (new) subscribe to registered inputs.

```tsx
<input name="test" ref={register} />;

function IsolateReRender() {
  const { state } = useWatch({
    name: 'test',
    control,
    defaultValue: 'default',
  });

  return <div>{state}</div>;
}
```

- `getValues()` support array of field names

```typescript jsx
getValues(['test', 'test1']); // { test: 'test', test1: 'test1' }
```

- `useForm({ mode: 'all' })` support all validation

### Changed

- rename `validationResolver` to `resolver`
- rename `validationContext` to `context`
- rename `validateCriteriaMode` to `criteriaMode`
- rename `triggerValidation` to `trigger`
- rename `clearError` to `clearErrors`
- rename `FormContext` to `FormProvider`
- rename `dirty` to `isDirty`
- `dirtyFields` change type from `Set` to `Object`

- Controller with render props API, and removed the following props:
  - onChange
  - onChangeName
  - onBlur
  - onBlurName
  - valueName

```diff
-<Controller
-  as={CustomInput}
-  valueName="textValue"
-  onChangeName="onTextChange"
-  control={control}
-  name="test"
-/>
+<Controller
+  render={({ onChange, onBlur, value }) => (
+     <CustomInput onTextChange={onChange} onBlur={onBlur} textValue={value} />
+  )}
+  control={control}
+  name="test"
+/>
```

- `setError` will focus one error at a time and remove confusing set multiple errors, behavior change.
  - setError will persis an error if it's not part of the form, which requires manual remove with clearError
  - setError error will be removed by validation rules, rules always take over errors

```diff
- setError('test', 'test', 'test')
+ setError('test', { type: 'test', message: 'bill'})
```

- `setValue` will focus on input at a time

```diff
setValue('test', 'value', { shouldValidate: false, shouldDirty: false })
```

### Removed

- remove `validationSchema` and embrace validation `resolver`
- remove `nest` option for `watch` & `getValues`, so data return from both methods will be in FormValues shape.

```diff
-getValues({ nest: true }); // { test: { data: 'test' }}
-watch({ nest: true }); // { test: { data: 'test' }}
+getValues(); // { test: { data: 'test' }}
+watch(); // { test: { data: 'test' }}
```

## [5.0.0] - 2020-03-07

### Breaking Change

- `Controller`: onChange will only evaluate payload as event like object. eg: react-select will no longer need the extra `onChange` method at `Controller`.

```diff
import { TextInput } from 'react-native';

-<Controller
-  as={<TextInput style={{ borderWidth: 2, borderColor: 'black'}} />}
-  name="text"
-  control={args => ({
-    value: args[0].nativeEvent.text,
-  })}
-  onChange={onChange}
-/>
+<Controller
+  as={<TextInput style={{ borderWidth: 2, borderColor: 'black'}} />}
+  name="text"
+  control={args => args[0].nativeEvent.text}
+  onChange={onChange}
+/>
```

## [4.0.0] - 2019-12-24

### Breaking changes

- improve module **exports**:

```tsx
import { useForm } from 'react-hook-form';
```

- nested `errors` object and better typescript support

```tsx
type form = {
  yourDetail: {
    firstName: string;
  };
};

errors?.yourDetail?.firstName;
```

- triggerValidation argument change from `Object`, `Object[]` to `String`, `String[]`

```tsx
triggerValidation('firstName');
triggerValidation(['firstName', 'lastName']);
```

- watch support `{ nest: boolean }`

```tsx
watch(); // { 'test.firstName': 'bill' }
watch({ nest: true }); // { test: { firstName: 'bill' } }
```

- improve custom `register`

```tsx
register('test', { required: true });
```

- setError` support nested object

```tsx
setError('yourDetail.firstName', 'test');
errors.yourDetails.firstName;
```

- `handleSubmit` no longer rerun array inputs contains `undefined` or `null`

### Added

- move `RHFInput` into the main repo and rename it to `Controller`

```tsx
<Controller control={control} name="test" />
```

### Removed

- `validationSchemaOption`: hardly anyone want to use validation with abort early, or change the config.

- native validation: hardly anyone used this feature. https://react-hook-form.com/api/#Browserbuiltinvalidation

## [3.0.0] - 2019-04-21

### Added

React Hook Form return a new `formState: Object` which contain the following information

- `dirty`: when user interactive any fields
- `touched`: what are the fields have interacted
- `isSubmitted`: whether the form have been triggered with submitting

```tsx
const {
  formState: { dirty, touched, isSubmitted },
} = useForm();
```

## [2.0.0] - 2019-03-29

### Added

- support `ref={register}` instead of only `ref={register()}`
