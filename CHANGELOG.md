# Changelog

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

## [6.4.0] - 2020-08-15

### Added

- `Controller`'s `render` prop will pass down `name` prop
- `handleSubmit` take a second callback for errors callback
- new mode `onTouched` will only trigger validation after inputs are touched

### Changed

- `register` no longer compare `ref` difference with React Native

## [6.2.0] - 2020-08-11

### Changed

- IE 11 version will be required to install `@babel/runtime-corejs3` as dependency at your own project

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

```typescript diff
-getValues({ nest: true }); // { test: { data: 'test' }}
-watch({ nest: true }); // { test: { data: 'test' }}
+getValues(); // { test: { data: 'test' }}
+watch(); // { test: { data: 'test' }}
```
