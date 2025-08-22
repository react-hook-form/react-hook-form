# `ScrollIntoView` method on field refs

## Purpose

The scrollIntoView method enhancement exposes the native DOM `scrollIntoView()` function on field refs returned by `useController` and `Controller` components. This feature enables developers to programmatically scroll to form fields, which is particularly useful for error handling, form navigation, and improving user experience.

### Benefits

- Enable smooth scrolling to form fields for better user experience
- Support error handling workflows by scrolling to fields with validation errors
- Provide programmatic control over form field visibility
- Maintain compatibility with all standard `ScrollIntoViewOptions`
- Work seamlessly with both `useController` hook and `Controller` component

## API Changes

### Enhanced properties

- `field.ref`: Now includes a `scrollIntoView` method in addition to existing ref functionality

### Type updates

- `ControllerRenderProps` type updated to include the new method:

```typescript
export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  // ... existing properties
  ref: RefCallBack & {
    scrollIntoView?: (options?: ScrollIntoViewOptions) => void; // New method added
  };
};
```

### Method signature

```typescript
field.ref.scrollIntoView(options?: ScrollIntoViewOptions) => void
```

**Parameters:**

- `options` (optional): Standard `ScrollIntoViewOptions` object supporting:
  - `behavior?: 'auto' | 'instant' | 'smooth'`
  - `block?: 'start' | 'center' | 'end' | 'nearest'`
  - `inline?: 'start' | 'center' | 'end' | 'nearest'`

## Examples

### Basic usage with useController

```jsx
import { useController, useForm } from '@bombillazo/rhf-plus';

function MyForm() {
  const { control } = useForm();
  const { field, fieldState } = useController({
    name: 'email',
    control,
    rules: { required: 'Email is required' },
  });

  const handleScrollToField = () => {
    // Smooth scroll to the field
    field.ref.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <div>
      <input {...field} placeholder="Email" />
      {fieldState.error && (
        <button onClick={handleScrollToField}>Scroll to Email Field</button>
      )}
    </div>
  );
}
```

### Error handling workflow

```jsx
import { useForm, useController } from '@bombillazo/rhf-plus';

function FormWithErrorHandling() {
  const { control, handleSubmit, formState } = useForm();

  const emailController = useController({
    name: 'email',
    control,
    rules: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Invalid email address',
      },
    },
  });

  const passwordController = useController({
    name: 'password',
    control,
    rules: { required: 'Password is required', minLength: 8 },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  const onError = (errors) => {
    // Scroll to first field with error
    const firstErrorField = Object.keys(errors)[0];

    if (
      firstErrorField === 'email' &&
      emailController.field.ref.scrollIntoView
    ) {
      emailController.field.ref.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else if (
      firstErrorField === 'password' &&
      passwordController.field.ref.scrollIntoView
    ) {
      passwordController.field.ref.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <div>
        <input {...emailController.field} placeholder="Email" />
        {emailController.fieldState.error && (
          <p style={{ color: 'red' }}>
            {emailController.fieldState.error.message}
          </p>
        )}
      </div>

      <div>
        <input
          {...passwordController.field}
          type="password"
          placeholder="Password"
        />
        {passwordController.fieldState.error && (
          <p style={{ color: 'red' }}>
            {passwordController.fieldState.error.message}
          </p>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Usage with Controller component

```jsx
import { Controller, useForm } from '@bombillazo/rhf-plus';

function MyForm() {
  const { control } = useForm();

  return (
    <form>
      <Controller
        name="description"
        control={control}
        rules={{ required: 'Description is required' }}
        render={({ field, fieldState }) => (
          <div>
            <textarea {...field} placeholder="Description" />
            {fieldState.error && (
              <div>
                <p style={{ color: 'red' }}>{fieldState.error.message}</p>
                <button
                  type="button"
                  onClick={() =>
                    field.ref.scrollIntoView?.({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                >
                  Scroll to Description
                </button>
              </div>
            )}
          </div>
        )}
      />
    </form>
  );
}
```

## Browser Support

The `scrollIntoView` method leverages the native DOM `Element.scrollIntoView()` API. For older browsers, the method will gracefully fallback or not execute if `scrollIntoView` is not available on the element.

## Backward Compatibility

This enhancement is fully backward compatible:

- The method only executes if the DOM element supports `scrollIntoView`
- Existing `field.ref` usage continues to work unchanged
- No breaking changes to existing APIs
- All existing field ref methods (`focus`, `select`, etc.) remain available
