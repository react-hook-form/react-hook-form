# Form `hasBeenSubmitted` state

## Purpose

This enhancement adds a new form state property `hasBeenSubmitted` that tracks whether the form has ever been submitted at least once. Unlike `isSubmitted`, this flag persists through form resets, providing a persistent submission history for the lifetime of the form instance.

### Benefits

- Track if a form has ever been submitted, even after resets
- Enable conditional UI/UX based on submission history

## API Changes

### Property updates

- `hasBeenSubmitted`: a boolean prop added to form state that tracks whether the form has ever been submitted.
- `hasBeenSubmitted` added to `FormState`:

```typescript
type FormState = {
  hasBeenSubmitted: boolean;
  // ... other form state properties
};
```

### Description

The `hasBeenSubmitted` property is available in `formState` from both `useForm` and `useFormState`. This property provides a persistent way to track submission history that is independent of form resets, making it ideal for conditional UI based on user interaction history.

### Behavior

1. **Initial state**: Initialized to `false` when the form is first rendered
2. **First submission**: Changes to `true` on the first successful form submission
3. **Subsequent submissions**: Remains `true` for all future submissions
4. **Form reset**: Persists as `true` even when the form is reset (unlike `isSubmitted`)
5. **Form unmount**: Resets to `false` only when the form component is unmounted and remounted

### Examples

#### Basic Usage

```jsx
import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

function FeedbackForm() {
  const {
    register,
    handleSubmit,
    formState: { hasBeenSubmitted, isSubmitted },
    reset,
  } = useForm({
    defaultValues: {
      rating: '',
      comment: '',
    },
  });

  const onSubmit = async (data) => {
    console.log('Feedback submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('rating', { required: true })}>
        <option value="">Select rating</option>
        <option value="5">Excellent</option>
        <option value="4">Good</option>
        <option value="3">Average</option>
      </select>

      <textarea {...register('comment')} placeholder="Your comments" />

      {/* Show thank you message if form was ever submitted */}
      {hasBeenSubmitted && (
        <div className="info">
          Thank you for your feedback! Feel free to submit more.
        </div>
      )}

      <div className="debug">
        <p>Has been submitted (ever): {hasBeenSubmitted ? 'Yes' : 'No'}</p>
        <p>Is submitted (current): {isSubmitted ? 'Yes' : 'No'}</p>
      </div>

      <button type="submit">Submit Feedback</button>
      <button type="button" onClick={() => reset()}>
        Clear Form
      </button>
    </form>
  );
}
```

## Limitations

- The flag only resets when the form component is completely unmounted and remounted.
- Cannot be manually reset to `false` once set to `true` during the component lifecycle.

## Backward Compatibility

This feature is fully backward compatible:

- Existing forms continue to work without any changes
- No breaking changes to existing APIs
