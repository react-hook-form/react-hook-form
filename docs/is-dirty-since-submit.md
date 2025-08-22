# `isDirtySinceSubmit` form state

## Overview

The `isDirtySinceSubmit` property is a boolean value in the form state that indicates whether any form fields have been modified since the last form submission. This is particularly useful for managing submission errors and providing better user experience.

## Use Cases

### Clearing Submission Errors

The primary use case for `isDirtySinceSubmit` is to automatically hide server-side submission errors when the user starts correcting the form:

```tsx
function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirtySinceSubmit },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      // Show server error
      setError('root.server', {
        type: 'server',
        message: 'Invalid credentials',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      <input {...register('password')} type="password" />

      {/* Hide server error if user has modified form since submission */}
      {errors.root?.server && !isDirtySinceSubmit && (
        <p>{errors.root.server.message}</p>
      )}

      <button type="submit">Login</button>
    </form>
  );
}
```

## Behavior

- **Initial State**: `isDirtySinceSubmit` is `false` when the form is first rendered
- **Before First Submit**: Remains `false` regardless of field changes
- **On Submit**: Resets to `false` when the form is submitted
- **After Submit**: Changes to `true` when any field is modified after submission
- **On Reset**: Resets to `false` when the form is reset

## Example

```tsx
import { useForm } from 'react-hook-form';

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { isDirtySinceSubmit, isSubmitted, errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data) => {
    console.log('Submitting:', data);
    // After submission, isDirtySinceSubmit will be false
    // It will become true when user modifies any field
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      <input {...register('email', { required: true })} />
      <textarea {...register('message', { required: true })} />

      <div>
        Form submitted: {isSubmitted ? 'Yes' : 'No'}
        <br />
        Dirty since last submit: {isDirtySinceSubmit ? 'Yes' : 'No'}
      </div>

      <button type="submit">Submit</button>
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
    </form>
  );
}
```

## Integration with Other Form State

`isDirtySinceSubmit` works alongside other form state properties:

- **isDirty**: Indicates if any field has been modified from default values
- **isSubmitted**: Indicates if the form has been submitted at least once
- **submitCount**: Tracks the number of form submissions
- **isDirtySinceSubmit**: Specifically tracks changes after the most recent submission

## TypeScript

The `isDirtySinceSubmit` property is automatically typed as a boolean in the `FormState` type:

```typescript
interface FormState<TFieldValues> {
  // ... other properties
  isDirtySinceSubmit: boolean;
  // ... other properties
}
```

## Notes

- This feature is particularly useful for forms that handle server-side validation errors
- It helps provide immediate feedback when users correct form errors
- The property is reset on both form submission and form reset
- Works with all validation modes (onSubmit, onBlur, onChange, onTouched, all)
