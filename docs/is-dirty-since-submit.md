# Form `isDirtySinceSubmit` state

## Purpose

This enhancement adds a new form state property that tracks whether any form fields have been modified since the last form submission. This is particularly useful for managing submission errors and providing better user experience when dealing with server-side validation.

### Benefits

- Automatically track field changes after form submission
- Clear errors when users start correcting the form
- Improve UX by showing/hiding submission errors appropriately
- Works with all input types and validation modes

## API Changes

### Property updates

- `isDirtySinceSubmit`: a boolean prop available in `formState` that tracks whether any form fields have been modified since the last form submission.
- The property is available in both `useForm` and `useFormState`.

```typescript
type FormState = {
  isDirtySinceSubmit: boolean;
  // ... other form state properties
};
```

### Description

The `isDirtySinceSubmit` property is available in `formState` from both `useForm` and `useFormState` and tracks field modifications after form submission.

### Behavior

1. **Initial state**: Initialized to `false` when the form is first rendered
2. **Pre-submit**: Remains `false` regardless of field changes before first submit
3. **On submit**: Resets to `false` when the form is submitted
4. **Post-submit**: Changes to `true` when any field is modified after submission
5. **Form reset**: Resets to `false` but remembers it has been submitted for future changes

### Examples

#### Basic Usage

```jsx
import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { isDirtySinceSubmit, isSubmitted },
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

#### Using with useFormState

```jsx
import React from 'react';
import { useForm, useFormState } from '@bombillazo/rhf-plus';

const ErrorDisplay = ({ control }) => {
  const { isDirtySinceSubmit } = useFormState({ control });

  return (
    <div>
      {!isDirtySinceSubmit && (
        <div className="error-message">Please correct the errors above</div>
      )}
    </div>
  );
};

function FormWithErrorDisplay() {
  const { register, control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      <input {...register('password')} />
      <ErrorDisplay control={control} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Limitations

This feature has no significant limitations:

- Works with all input types and validation modes
- Compatible with all form configurations
- No performance impact on form operations

## Backward compatibility

This feature is fully backward compatible:

- Existing forms continue to work without any changes
- Compatible with all validation modes and form configurations
