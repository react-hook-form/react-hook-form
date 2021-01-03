# Changelog

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
  defaultValue: 'data', // this value will only show on the inital render
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
