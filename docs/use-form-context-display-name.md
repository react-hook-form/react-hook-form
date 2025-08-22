# Add displayName to `useFormContext`

## Purpose

Add a `displayName` property to the `HookFormContext` context for better developer experience when debugging React Hook Form contexts in React DevTools.

### Benefits

- Improved debugging experience in React DevTools
- Easier identification of form context providers in component trees
- Clearer component hierarchy visualization

## API Changes

### Implementation Details

The `FormProvider` component now includes a `displayName` property set to `"HookFormContext"`. This allows React DevTools to display a meaningful name instead of an anonymous component.

## Examples

### Using FormProvider with DevTools

```tsx
import { useForm, FormProvider, useFormContext } from '@bombillazo/rhf-plus';

function App() {
  const methods = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  return (
    // This will show as "HookFormContext" in React DevTools
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)}>
        <NestedFormComponent />
      </form>
    </FormProvider>
  );
}

function NestedFormComponent() {
  const { register } = useFormContext(); // Easy to trace in DevTools

  return (
    <div>
      <input {...register('firstName')} placeholder="First Name" />
      <input {...register('lastName')} placeholder="Last Name" />
      <input {...register('email')} placeholder="Email" />
    </div>
  );
}
```

## Backward Compatibility

This change is fully backward compatible. It only adds a `displayName` property for debugging purposes and doesn't affect any runtime behavior or API.
