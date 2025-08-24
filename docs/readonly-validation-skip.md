# Readonly field validation skip

## Purpose

The readonly validation skip feature allows you to opt-in to excluding fields with the `readOnly` HTML attribute from form validation, similar to how disabled fields are handled. This provides a better user experience by preventing validation errors on fields that users cannot modify.

### Benefits

- Prevent validation errors on readonly fields that users cannot modify
- Maintain consistent behavior with disabled field handling
- Improve form usability in cases where fields are conditionally readonly
- Reduce need for complex conditional validation logic

## API Changes

### New properties

- `shouldSkipReadOnlyValidation`: A boolean flag that enables readonly field validation skipping when set to `true`

### Type updates

- `shouldSkipReadOnlyValidation` added to `useFormProps`:

```typescript
export type UseFormProps<...> = Partial<{
    // ... existing properties
    shouldSkipReadOnlyValidation?: boolean; // New property
}>;
```

### Description

When `shouldSkipReadOnlyValidation` is set to `true`, fields with the HTML `readOnly` attribute are excluded from all validation rules while maintaining their form integration for value updates and submission data.

## Behavior

When `shouldSkipReadOnlyValidation: true` is set, readonly fields with the HTML `readOnly` attribute are excluded from field validation rules. However, readonly fields still:

- Update form values when changed programmatically
- Maintain touch and dirty state tracking
- Are included in form submission data
- Support programmatic value updates via `setValue`

## Examples

### Basic readonly field

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    shouldSkipReadOnlyValidation: true, // Enable readonly validation skip
    defaultValues: {
      readonlyField: 'preset-value',
      editableField: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data); // Includes both readonly and editable fields
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* This field will not validate even though it has required rule */}
      <input
        {...register('readonlyField', { required: 'This field is required' })}
        readOnly
      />
      {errors.readonlyField && <span>{errors.readonlyField.message}</span>}

      {/* This field will validate normally */}
      <input
        {...register('editableField', { required: 'This field is required' })}
      />
      {errors.editableField && <span>{errors.editableField.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Coexistence with disabled fields

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    shouldSkipReadOnlyValidation: true, // Enable readonly validation skip
    defaultValues: {
      readonlyField: '',
      disabledField: '',
      normalField: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Readonly field - validation skipped */}
      <input
        {...register('readonlyField', { required: 'Required' })}
        readOnly
      />

      {/* Disabled field - validation skipped */}
      <input
        {...register('disabledField', { required: 'Required' })}
        disabled
      />

      {/* Normal field - validation applies */}
      <input {...register('normalField', { required: 'Required' })} />
      {errors.normalField && <span>{errors.normalField.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Backward Compatibility

This feature is fully backward compatible:

- **Default behavior**: `shouldSkipReadOnlyValidation` defaults to `false`, so readonly fields are validated normally (original behavior)
- Existing forms continue to work without any changes
- All existing validation rules continue to work on all fields unless explicitly opted out
- No breaking changes to existing APIs or behavior
