# `Controller` children function

## Purpose

Currently, the `Controller` component in React Hook Form (RHF) only supports a `render` prop for rendering the controlled component. This enhancement adds support for a `children` function prop.

### Benefits

- Provide more intuitive usage that aligns with common React component patterns.
- Allow developers to use the `Controller` component in their preferred way (render prop or children function).
- Maintain parity with other React libraries and provides a better developer experience.

## API Changes

### Property updates

- `children`: added support for using children prop in the `Controller` component.
- `children` prop accepts the same signature as the `render` prop:

```typescript
export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = (
  | {
      render: ControllerRender<TFieldValues, TName>;
    }
  | {
      children: ControllerRender<TFieldValues, TName>; // New: children prop as alternative
    }
) &
  UseControllerProps<TFieldValues, TName, TTransformedValues>;

// New shared type for the render/children function
export type ControllerRender<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = ({
  field,
  fieldState,
  formState,
}: {
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<TFieldValues>;
}) => React.ReactElement;
```

### Description

The `Controller` component now supports both `render` and `children` function patterns for rendering controlled components. Both props accept identical function signatures and provide the same field, fieldState, and formState arguments to their respective functions.

### Behavior

The component internally handles both patterns identically, with the function receiving field control props, field state, and form state as arguments.

### Examples

#### Previous use cases

```tsx
<Controller
  control={control}
  name="test"
  render={({
    field: { onChange, onBlur, value, ref },
    formState,
    fieldState,
  }) => (
    <>
      <input
        onChange={onChange} // send value to hook form
        onBlur={onBlur} // notify when input is touched
        value={value} // return updated value
        ref={ref} // set ref for focus management
      />
      <p>{formState.isSubmitted ? 'submitted' : ''}</p>
      <p>{fieldState.isTouched ? 'touched' : ''}</p>
    </>
  )}
/>
```

#### New supporting usage

```tsx
<Controller
  control={control}
  name="test"
>
  ({field: {onChange, onBlur, value, ref}, formState, fieldState}) => (
  <>
    <input
      onChange={onChange} // send value to hook form
      onBlur={onBlur} // notify when input is touched
      value={value} // return updated value
      ref={ref} // set ref for focus management
    />
    <p>{formState.isSubmitted ? "submitted" : ""}</p>
    <p>{fieldState.isTouched ? "touched" : ""}</p>
  </>
  )
</Controller>
```

## Limitations

- Only one of `render` or `children` can be used at a time - they are mutually exclusive. `children` will take precedence if both are provided.

## Backward Compatibility

This feature is fully backward compatible. The existing `render` prop pattern continues to work, and the `children` function pattern is an additional option.
