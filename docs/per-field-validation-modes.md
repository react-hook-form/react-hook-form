# Per-Field Validation Modes

## Purpose

Per-field validation modes allow you to override form-level validation timing (`mode` and `reValidateMode`) for individual fields. This provides granular control over when each field validates, enabling you to optimize the user experience based on field-specific requirements.

### Benefits

- Set different validation strategies for different fields (e.g., validate email on blur, password on change)
- Improve UX by choosing appropriate validation timing for each field type
- Maintain form-level defaults while customizing specific fields
- Reduce validation noise for complex forms with mixed field types

## API Changes

### Property updates

- `mode`: added to `RegisterOptions` type
- `reValidateMode`: added to `RegisterOptions` type
- `mode`: added to `UseControllerProps` type (as direct prop)
- `reValidateMode`: added to `UseControllerProps` type (as direct prop)

```typescript
// RegisterOptions now includes mode and reValidateMode
export type RegisterOptions<...> = Partial<{
  // ... existing options
  mode: Mode;
  reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
}>;

// UseControllerProps now includes mode and reValidateMode as direct props
export type UseControllerProps<...> = {
  // ... existing props
  mode?: Mode;
  reValidateMode?: Exclude<Mode, 'onTouched' | 'all'>;
};
```

### Description

The enhanced validation system supports two levels of configuration:

1. **Form-level** (existing functionality): Set default `mode` and `reValidateMode` in `useForm` options
2. **Field-level** (new functionality): Override form-level modes for specific fields via `register` options or Controller props

**Field-level modes take precedence** over form-level modes, allowing fine-grained control while maintaining sensible defaults.

### Validation Modes

- `onSubmit` (default): Validate only on form submission
- `onBlur`: Validate when field loses focus
- `onChange`: Validate on every input change
- `onTouched`: Validate after first blur, then on every change
- `all`: Validate on all events (blur, change, submit)

## Examples

### Basic field-level mode with `register`

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit', // Form-level default: validate on submit
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* This field uses form default (onSubmit) */}
      <input
        {...register('username', { required: 'Required' })}
        placeholder="Username"
      />
      {errors.username && <span>{errors.username.message}</span>}

      {/* This field overrides to validate onChange */}
      <input
        {...register('email', {
          required: 'Required',
          mode: 'onChange', // Field-level override
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      {/* This field overrides to validate onBlur */}
      <input
        {...register('password', {
          required: 'Required',
          minLength: { value: 8, message: 'At least 8 characters' },
          mode: 'onBlur', // Field-level override
        })}
        type="password"
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Using Controller component

```jsx
import { useForm, Controller } from '@bombillazo/rhf-plus';

function App() {
  const { control, handleSubmit } = useForm({
    mode: 'onSubmit',
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Field with onChange validation mode */}
      <Controller
        control={control}
        name="email"
        mode="onChange" // Direct prop for validation mode
        rules={{ required: 'Email is required' }}
        render={({ field, fieldState }) => (
          <div>
            <input {...field} placeholder="Email" />
            {fieldState.error && <span>{fieldState.error.message}</span>}
          </div>
        )}
      />

      {/* Field with onBlur validation mode */}
      <Controller
        control={control}
        name="password"
        mode="onBlur" // Direct prop for validation mode
        rules={{ required: 'Password is required' }}
        render={({ field, fieldState }) => (
          <div>
            <input {...field} type="password" placeholder="Password" />
            {fieldState.error && <span>{fieldState.error.message}</span>}
          </div>
        )}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Per-field reValidateMode

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange', // After submit, revalidate on every change
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Uses form-level reValidateMode (onChange) */}
      <input
        {...register('username', { required: 'Required' })}
        placeholder="Username"
      />
      {errors.username && <span>{errors.username.message}</span>}

      {/* Overrides to only revalidate on blur after submission */}
      <input
        {...register('description', {
          required: 'Required',
          reValidateMode: 'onBlur', // Field-level override for post-submit validation
        })}
        placeholder="Description"
      />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Mixed validation strategies

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit', // Default: validate on submit only
    reValidateMode: 'onChange', // Default: after submit, validate on every change
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Username: use defaults (onSubmit, then onChange) */}
      <input {...register('username', { required: true })} />

      {/* Email: validate immediately on change (better UX for email format) */}
      <input
        {...register('email', {
          required: true,
          pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          mode: 'onChange',
        })}
      />

      {/* Password: validate on blur to avoid annoying the user while typing */}
      <input
        type="password"
        {...register('password', {
          required: true,
          minLength: 8,
          mode: 'onBlur',
          reValidateMode: 'onBlur', // Even after submit, only revalidate on blur
        })}
      />

      {/* Confirm Password: validate on blur */}
      <input
        type="password"
        {...register('confirmPassword', {
          required: true,
          validate: (value, formValues) => value === formValues.password,
          mode: 'onBlur',
        })}
      />

      {/* Terms: use onAll for immediate feedback */}
      <label>
        <input
          type="checkbox"
          {...register('acceptTerms', {
            required: true,
            mode: 'all',
          })}
        />
        I accept the terms
      </label>

      <button type="submit">Register</button>
    </form>
  );
}
```

### Dynamic mode changes

```jsx
import { useForm } from '@bombillazo/rhf-plus';
import { useState } from 'react';

function App() {
  const [emailMode, setEmailMode] = useState('onSubmit');
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <div>
        <label>
          Email validation mode:
          <select
            value={emailMode}
            onChange={(e) => setEmailMode(e.target.value)}
          >
            <option value="onSubmit">On Submit</option>
            <option value="onChange">On Change</option>
            <option value="onBlur">On Blur</option>
            <option value="onTouched">On Touched</option>
          </select>
        </label>
      </div>

      <input
        {...register('email', {
          required: 'Email is required',
          mode: emailMode,
        })}
        placeholder="Email"
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Nested fields with different modes

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* User name: validate on submit */}
      <input
        {...register('user.name', { required: true })}
        placeholder="Name"
      />

      {/* User email: validate on change */}
      <input
        {...register('user.email', {
          required: true,
          mode: 'onChange',
        })}
        placeholder="Email"
      />

      {/* Address city: validate on blur */}
      <input
        {...register('user.address.city', {
          required: true,
          mode: 'onBlur',
        })}
        placeholder="City"
      />

      {/* Address country: use form default (onSubmit) */}
      <input
        {...register('user.address.country', { required: true })}
        placeholder="Country"
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### With custom validation logic

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const validateUsername = async (value) => {
    // Simulate API call
    const response = await fetch(`/api/check-username?name=${value}`);
    const data = await response.json();
    return data.available || 'Username already taken';
  };

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {/* Username: validate on blur to avoid excessive API calls */}
      <input
        {...register('username', {
          required: 'Username is required',
          validate: validateUsername,
          mode: 'onBlur', // Only validate when user finishes typing
        })}
        placeholder="Username"
      />
      {errors.username && <span>{errors.username.message}</span>}

      {/* Password strength: validate onChange for immediate feedback */}
      <input
        type="password"
        {...register('password', {
          required: 'Password is required',
          validate: {
            strength: (value) =>
              value.length >= 8 || 'Password must be at least 8 characters',
            hasNumber: (value) =>
              /\d/.test(value) || 'Password must contain a number',
            hasSpecial: (value) =>
              /[!@#$%^&*]/.test(value) ||
              'Password must contain a special character',
          },
          mode: 'onChange', // Immediate feedback for password strength
        })}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Register</button>
    </form>
  );
}
```

## Limitations

### Edge Cases

- Field-level modes always take precedence over form-level modes
- Changing mode dynamically requires re-registering the field or using Controller
- Mode changes only affect validation timing, not which validations run

## Backward compatibility

This enhancement is fully backward compatible:

- Existing forms without field-level modes work exactly as before
- Form-level `mode` and `reValidateMode` remain the default
- No breaking changes to existing APIs or behavior
- All existing validation rules and patterns continue to work
