# Controllable `isLoading` state

## Purpose

This feature allows developers to control the `isLoading` prop to manage the loading state of forms programmatically.

### Benefits

- Provide better control over the Form loading state based on external conditions or events.

## API Changes

### New properties

- `isLoading`: a boolean prop that indicates whether the form is in a loading state. This prop overrides the internal loading state of the form only if the internal loading state is `false`.

### Type updates

- `isLoading` added to `useFormProps`:

```typescript
export type UseFormProps<...> = Partial<{
    // ... existing properties
    isLoading: boolean; // New property
}>;
```

### Description

Normally, the `isLoading` prop is a boolean that indicates whether the form is currently in a loading state based on the default values async function. If default values are synchronous, the state starts as `false`. With this feature, the `isLoading` prop can be controlled externally, allowing developers to set it to `true` based on their own logic, and have it accessible from the form state.

## Examples

```jsx
// Example using the useForm hook
import React, { useState } from 'react';
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm({
    isLoading,
    defaultValues: { name: '' }, // works with async default values too!
  });

  return (
    <>
      <Button onClick={() => setIsLoading(!isLoading)}>Toggle Loading</Button>
      <p>
        This form is {form.formState.isLoading ? 'loading!' : 'not loading.'}
      </p>
      <form onSubmit={form.handleSubmit((data) => console.log(data))}>
        <input {...form.register('name')} />
      </form>
      <Button onClick={() => form.submit()}>Submit</Button>
    </>
  );
}
```

## Backward Compatibility

This feature is fully backward compatible. The `isLoading` prop is optional and doesn't affect existing forms that don't use it.
