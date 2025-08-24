# Form and field `focus` state

## Purpose

This enhancement adds native focus tracking to React Hook Form, allowing you to track which field is currently focused without managing focus state in userland code. The feature provides both form-level tracking (`focusedField`) and field-level tracking (`isFocused`) for maximum flexibility.

### Benefits

- Track focus state without additional event handlers or state management
- Works with all form input types and Controller components
- Field-level `isFocused` property available in fieldState for Controllers

## API Changes

### Property updates

- `focusedField`: a string prop added to form state to track which field is currently focused
- `isFocused`: a boolean prop added to the field state to indicate if the specific field is focused
- `focusedField` added to `FormState`:

```typescript
type FormState = {
  focusedField: FieldPath<TFieldValues> | undefined;
  // ... other form state properties
};
```

- `isFocused` added to `FieldState`:

```typescript
type FieldState = {
  isFocused: boolean;
  // ... other field state properties
};
```

### Description

The focus tracking feature provides both form-level and field-level focus state management. The `focusedField` property is available in both `formState` from `useForm` and `useFormState`, while the `isFocused` property is available in fieldState for Controllers and `getFieldState`.

### Behavior

1. **Single focus tracking**: Only one field can be focused at a time - focusing a new field automatically clears the previous focused field
2. **Real-time updates**: Focus state updates immediately when fields gain or lose focus
3. **Form reset compatibility**: Focused field is cleared when the form is reset
4. **Works everywhere**: Compatible with `register`, `Controller`, nested fields, and field arrays

### Examples

#### Basic Focus Tracking

```jsx
import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

function FocusTrackingForm() {
  const {
    register,
    formState: { focusedField },
  } = useForm();

  return (
    <form>
      <div>
        <input {...register('firstName')} placeholder="First Name" />
        <span>{focusedField === 'firstName' ? 'Focused' : 'Not focused'}</span>
      </div>
      <div>
        <input {...register('email')} placeholder="Email" />
        <span>{focusedField === 'email' ? 'Focused' : 'Not focused'}</span>
      </div>

      <div>Current focused field: {focusedField || 'None'}</div>
    </form>
  );
}
```

#### Using with useFormState

```jsx
import React from 'react';
import { useForm, useFormState } from '@bombillazo/rhf-plus';

const FocusIndicator = ({ control }) => {
  const { focusedField } = useFormState({ control });

  return (
    <div>
      <h3>Currently Focused:</h3>
      {focusedField ? <p>{focusedField}</p> : <p>No field focused</p>}
    </div>
  );
};

function FormWithFocusIndicator() {
  const { register, control } = useForm();

  return (
    <div>
      <form>
        <input {...register('username')} placeholder="Username" />
        <input {...register('password')} placeholder="Password" />
        <input
          {...register('confirmPassword')}
          placeholder="Confirm Password"
        />
      </form>
      <FocusIndicator control={control} />
    </div>
  );
}
```

#### Using with Controller

```jsx
import React from 'react';
import { useForm, Controller } from '@bombillazo/rhf-plus';

function ControllerFocusForm() {
  const { control } = useForm();

  return (
    <form>
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <textarea
              {...field}
              placeholder="Enter description"
              style={{
                border: fieldState.isFocused
                  ? '2px solid green'
                  : '1px solid gray',
              }}
            />
            {fieldState.isFocused && (
              <div style={{ color: 'green', fontSize: '12px' }}>
                Description field is focused
              </div>
            )}
          </div>
        )}
      />

      {/* You can also access form-level focused field */}
      <Controller
        name="title"
        control={control}
        render={({ field, formState }) => (
          <div>
            <input {...field} placeholder="Enter title" />
            <div>Currently focused: {formState.focusedField || 'None'}</div>
          </div>
        )}
      />
    </form>
  );
}
```

#### Using getFieldState

You can also use `getFieldState` to get field-level focus information:

```jsx
import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

function FieldStateExample() {
  const { register, getFieldState, formState } = useForm();

  const emailFieldState = getFieldState('email', formState);

  return (
    <form>
      <input {...register('email')} placeholder="Email" />
      <div>
        Email field is {emailFieldState.isFocused ? 'focused' : 'not focused'}
      </div>
    </form>
  );
}
```

## Limitations

- Focus tracking is limited to HTML input elements and components that properly handle focus/blur events.
- Programmatic focus changes (using `focus()` method) are tracked, but may have slight timing differences.

## Backward Compatibility

This feature is fully backward compatible:

- Existing forms continue to work without any changes
- No performance impact on forms that don't use `focusedField`
- All existing form state properties remain unchanged
- Compatible with all validation modes and form configurations
