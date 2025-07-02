# `Controller` supports children render props

## Purpose

- Provides more intuitive usage that aligns with common React component patterns by supporting children prop.
- Allows users to use the Controller component in their preferred way (render prop or children function).
- Maintains consistency with other React libraries and provides a better developer experience.

## API Changes

### New properties

- `children`: Added support for using children prop in the `Controller` component.

### Type updates

- `isLoading` added to `useFormProps`:

```diff
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

export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
- > = {
-   render: ({
-     field,
-     fieldState,
-     formState,
-   }: {
-     field: ControllerRenderProps<TFieldValues, TName>;
-     fieldState: ControllerFieldState;
-     formState: UseFormStateReturn<TFieldValues>;
-   }) => React.ReactElement;
- } & UseControllerProps<TFieldValues, TName, TTransformedValues>;
+ > = (
+   | {
+       render: ControllerRender<TFieldValues, TName>;
+     }
+   | {
+       children: ControllerRender<TFieldValues, TName>;
+     }
+ ) & UseControllerProps<TFieldValues, TName, TTransformedValues>;
```

## Examples

### Previous use cases

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

### New supporting usage

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
