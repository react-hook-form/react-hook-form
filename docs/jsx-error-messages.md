# JSX Error Messages

## Purpose

The JSX error messages enhancement allows developers to use React elements (`ReactElement`) as error messages instead of being limited to plain strings. This enables rich and interactive formatted error displays while maintaining full backward compatibility with existing string-based error messages.

### Benefits

- **Rich formatting**: Use HTML elements, custom styling, colors, and typography in error messages
- **Interactive content**: Include buttons, links, icons, and custom React components
- **Better user experience**: Create more engaging and informative error displays
- **Contextual information**: Display dynamic content, suggestions, or help text within errors

## API Changes

### Enhanced types

The core `Message` type has been enhanced to support React elements:

```diff
- export type Message = string;
+ export type Message = string | React.ReactElement;
```

### Method compatibility

All existing methods that work with error messages now support React elements:

- `setError(name, { message: <Component /> })`
- Validation rules: `required: <span>Required!</span>`
- Custom validators: `validate: () => <ErrorComponent />`
- Schema validation libraries (when returning JSX from custom messages)

## Examples

### Basic JSX error messages

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function BasicExample() {
  const {
    register,
    formState: { errors },
  } = useForm();

  return (
    <form>
      <input
        {...register('username', {
          required: (
            <span style={{ color: '#e74c3c' }}>
              <strong>Username is required</strong> 📝
            </span>
          ),
          minLength: {
            value: 3,
            message: (
              <div>
                Username must be at least <em>3 characters</em> long
                <br />
                <small>Choose something memorable!</small>
              </div>
            ),
          },
        })}
      />
      {errors.username && <div>{errors.username.message}</div>}
    </form>
  );
}
```

### Dynamic error messages with setError

```jsx
import { useForm } from '@bombillazo/rhf-plus';

function DynamicErrorExample() {
  const {
    register,
    setError,
    formState: { errors },
  } = useForm();

  const handleUsernameCheck = async (username) => {
    const isAvailable = await checkUsernameAvailability(username);

    if (!isAvailable) {
      setError('username', {
        type: 'availability',
        message: (
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            }}
          >
            <strong>❌ Username "{username}" is not available</strong>
            <div style={{ marginTop: '8px' }}>
              Try one of these suggestions:
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>{username}123</li>
                <li>{username}_user</li>
                <li>the_{username}</li>
              </ul>
            </div>
          </div>
        ),
      });
    }
  };

  return (
    <form>
      <input
        {...register('username')}
        onBlur={(e) => handleUsernameCheck(e.target.value)}
      />
      {errors.username && <div>{errors.username.message}</div>}
    </form>
  );
}
```

## Limitations

### 1. ReactElement only

Only React elements are supported, not all ReactNode types:

```jsx
// ✅ Supported: React elements
message: <div>Error message</div>;
message: <ErrorComponent />;

// ❌ Not supported: Primitives
message: null;
message: 42;
message: undefined;
```

### 2. Synchronous only

Error messages must be synchronous React elements:

```jsx
// ✅ Supported: Synchronous elements
message: <div>Immediate error</div>;

// ❌ Not supported: Promises or async components
message: Promise.resolve(<div>Async error</div>);
```

### 3. Context limitations

JSX error messages render in the same React context as your form component. If you need different context (like themes, i18n), ensure providers are available at the form level.

## Backward Compatibility

This enhancement is fully backward compatible:

- **Existing string messages**: Continue to work unchanged
- **Existing validation logic**: No modifications required
- **Type checking**: Gradual adoption without breaking changes
