# Smart `disabled` state

## Purpose

Smart form disabling enhances the existing `disabled` prop functionality by propagating form-level `disabled` to registered field props. It also accepts an array of field names for targeted field disabling, while maintaining backward compatibility with boolean values for full-form disabling.

### Benefits

- Enable developers to disable specific fields while keeping others enabled
- Provide fine-grained control over form interactivity
- Maintain backward compatibility with existing boolean disabled functionality
- Support dynamic disabled state changes for specific fields

## API Changes

### Property updates

- `disabled`: now accepts `boolean | FieldPath<TFieldValues>[]` instead of just `boolean`
- `disabled` type updated in `useFormProps`:

```typescript
export type UseFormProps<...> = Partial<{
    // ... existing properties
    disabled: boolean | FieldPath<TFieldValues>[]; // Enhanced: now accepts array of field paths
}>;
```

- `_disableForm` method signature updated in `Control` type:

```typescript
export type Control<...> = {
    // ... existing properties
    _disableForm: (disabled?: boolean | FieldPath<TFieldValues>[]) => void; // Enhanced signature
};
```

### Description

The enhanced `disabled` prop now supports two modes:

1. **Boolean mode** (existing functionality): When `disabled` is `true`, all fields in the form are disabled. When `false`, no fields are disabled by default.

2. **Array mode** (new functionality): When `disabled` is an array of field names, only the specified fields are disabled. Fields not in the array remain enabled.

Field-level disabled options (via `register` options or `Controller` props) take precedence over both boolean and array modes, allowing for fine-grained override control.

### Examples

#### Basic array usage

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const { register } = useForm({
    // Only disable firstName and email fields
    disabled: ['firstName', 'email'],
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  return (
    <form>
      <input {...register('firstName')} placeholder="First Name" />{' '}
      {/* Disabled */}
      <input {...register('lastName')} placeholder="Last Name" />{' '}
      {/* Enabled */}
      <input {...register('email')} placeholder="Email" /> {/* Disabled */}
    </form>
  );
}
```

#### Dynamic disabled fields

```jsx
import { useForm } from '@bombillazo/rhf-plus';
import { useState } from 'react';

function App() {
  const [disabledFields, setDisabledFields] = useState(['firstName']);

  const { register } = useForm({
    disabled: disabledFields,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const toggleEmailDisabled = () => {
    setDisabledFields((current) =>
      current.includes('email')
        ? current.filter((field) => field !== 'email')
        : [...current, 'email'],
    );
  };

  return (
    <form>
      <input {...register('firstName')} placeholder="First Name" />
      <input {...register('lastName')} placeholder="Last Name" />
      <input {...register('email')} placeholder="Email" />

      <button type="button" onClick={toggleEmailDisabled}>
        Toggle Email Disabled
      </button>
    </form>
  );
}
```

#### Field-level overrides

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const { register } = useForm({
    disabled: ['firstName', 'lastName'],
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  return (
    <form>
      {/* Disabled by array */}
      <input {...register('firstName')} placeholder="First Name" />

      {/* Override array disabled with field-level enabled */}
      <input
        {...register('lastName', { disabled: false })}
        placeholder="Last Name"
      />

      {/* Field-level disabled (not in array) */}
      <input {...register('email', { disabled: true })} placeholder="Email" />
    </form>
  );
}
```

#### Controller component support

```jsx
import { useForm, Controller } from '@bombillazo/rhf-plus';

function App() {
  const { control } = useForm({
    disabled: ['firstName'],
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  return (
    <form>
      <Controller
        control={control}
        name="firstName"
        render={({ field }) => (
          <input {...field} placeholder="First Name" />  {/* Disabled */}
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field }) => (
          <input {...field} placeholder="Last Name" />   {/* Enabled */}
        )}
      />

      {/* Controller-level override */}
      <Controller
        control={control}
        name="firstName"
        disabled={false}  // Override array disabled
        render={({ field }) => (
          <input {...field} placeholder="Override First Name" />  {/* Enabled */}
        )}
      />
    </form>
  );
}
```

#### Nested field paths

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const { register } = useForm({
    disabled: ['user.name', 'user.address.city'],
    defaultValues: {
      user: {
        name: '',
        email: '',
        address: {
          city: '',
          country: '',
        },
      },
    },
  });

  return (
    <form>
      <input {...register('user.name')} placeholder="Name" /> {/* Disabled */}
      <input {...register('user.email')} placeholder="Email" /> {/* Enabled */}
      <input {...register('user.address.city')} placeholder="City" />{' '}
      {/* Disabled */}
      <input {...register('user.address.country')} placeholder="Country" />{' '}
      {/* Enabled */}
    </form>
  );
}
```

#### Mixed with boolean mode

```jsx
import { useForm } from '@bombillazo/rhf-plus';
import { useState } from 'react';

function App() {
  const [disabledMode, setDisabledMode] = useState('selective');

  // Switch between boolean and array disabled modes
  const disabled = disabledMode === 'all' ? true : ['firstName', 'email'];

  const { register } = useForm({
    disabled,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  return (
    <form>
      <input {...register('firstName')} placeholder="First Name" />
      <input {...register('lastName')} placeholder="Last Name" />
      <input {...register('email')} placeholder="Email" />

      <button type="button" onClick={() => setDisabledMode('all')}>
        Disable All
      </button>
      <button type="button" onClick={() => setDisabledMode('selective')}>
        Disable Selective
      </button>
      <button type="button" onClick={() => setDisabledMode('none')}>
        Enable All
      </button>
    </form>
  );
}
```

## Limitations

### Edge Cases

- Empty array `disabled: []` behaves the same as `disabled: false`
- Non-existent field names in the array are ignored gracefully
- Field registration order doesn't affect disabled behavior
- Form reset preserves disabled state configuration

## Backward compatibility

This enhancement is fully backward compatible:

- Existing `disabled: true` behavior remains unchanged
- Existing `disabled: false` behavior remains unchanged
- Field-level disabled options continue to work as before
- All existing APIs and patterns continue to function normally
