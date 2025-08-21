# Controller rules no longer stale on prop change

## Purpose

This enhancement allows the validation rules provided to the `Controller` component to be updated dynamically. When the `rules` prop changes, the new validation rules are applied immediately without needing to unmount/remount the component or reinitialize the form.

### Benefits

- Change validation rules in response to user actions or application state
- Create forms where validation behavior adapts based on user selections
- Apply new validation rules instantly without component re-rendering
- Update each field's validation rules independently
- Seamless integration with existing `Controller` components

## Key Behaviors

1. **Immediate rule updates**: New rules take effect as soon as the `Controller` re-renders with updated props
2. **Previous errors cleared**: When rules change, previous validation errors are cleared appropriately
3. **Re-validation triggers**: Existing validation modes (`onBlur`, `onChange`, etc.) continue to work with new rules
4. **Form state consistency**: `isValid`, `errors`, and other form state properties update to reflect new validation rules

## Examples

### Basic Dynamic Rules

```jsx
import React, { useState } from 'react';
import { useForm, Controller } from '@bombillazo/rhf-plus';

function DynamicValidationExample() {
  const [validationMode, setValidationMode] = useState('none');
  const {
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onBlur',
  });

  const ruleConfigurations = {
    none: {},
    required: { required: 'This field is required' },
    minLength: { minLength: { value: 5, message: 'Minimum 5 characters' } },
    both: {
      required: 'This field is required',
      minLength: { value: 5, message: 'Minimum 5 characters' },
    },
  };

  return (
    <form>
      <div>
        {['none', 'required', 'minLength', 'both'].map((rule) => (
          <label key={rule}>
            <input
              type="radio"
              value={rule}
              checked={validationMode === rule}
              onChange={(e) => setValidationMode(e.target.value)}
            />
            {rule === 'both' ? 'Required + Min Length' : rule}
          </label>
        ))}
      </div>

      <Controller
        name="username"
        control={control}
        rules={ruleConfigurations[validationMode]}
        render={({ field, fieldState }) => (
          <div>
            <input {...field} placeholder="Username" />
            {fieldState.error && (
              <span style={{ color: 'red' }}>{fieldState.error.message}</span>
            )}
          </div>
        )}
      />

      <div>Form valid: {isValid ? 'Yes' : 'No'}</div>
    </form>
  );
}
```

## Backward Compatibility

This feature is fully backward compatible:

- Existing `Controller` usage with static rules continues to work unchanged
- No performance impact on forms that don't use dynamic rules
- Full TypeScript support for both static and dynamic rule patterns
