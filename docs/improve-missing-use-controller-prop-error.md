# Improve missing `useController` error on missing `control` prop

## Purpose

Improve the error message when the `control` prop is missing in the `useController` hook by providing a more descriptive and actionable error message.

### Benefits

- Help developers quickly identify improper `useController` hook setup
- Reduce debugging time by providing clear guidance on how to fix the issue
- Improve developer experience with more informative error messages

## API Changes

### Property updates

No new properties are added. This enhancement only improves existing error handling behavior. No type changes are required. All existing types remain unchanged.

### Description

The error message has been enhanced to provide clearer guidance when `useController` is used without a `control` prop. This improvement helps developers quickly understand what went wrong and how to fix it.

### Behavior

When `useController` is called without a `control` prop, the improved error message provides specific guidance about the missing requirement and suggests common solutions for resolving the issue.

### Examples

#### Incorrect Usage (Will throw improved error)

```tsx
import { useController } from '@bombillazo/rhf-plus';

function MyInput() {
  // ❌ This will throw an improved error message
  const { field } = useController({
    name: 'firstName',
    // missing control prop!
  });

  return <input {...field} />;
}
```

#### Correct Usage

```tsx
import { useForm, useController } from '@bombillazo/rhf-plus';

function MyForm() {
  const { control } = useForm();

  return (
    <form>
      <ControlledInput name="firstName" control={control} />
    </form>
  );
}

function ControlledInput({ name, control }) {
  // ✅ Correct: control prop is passed
  const { field } = useController({
    name,
    control,
  });

  return <input {...field} />;
}
```

## Limitations

None. This change only affects error scenarios that were already failing.

## Backward Compatibility

This change is fully backward compatible. It only improves the error message when an error condition already exists - it doesn't change any successful execution paths.
