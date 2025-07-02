# `Controller` children function prop

## Purpose

Currently, the `Controller` component in React Hook Form (RHF) only supports a `render` prop for rendering the controlled component. This enhancement adds support for a `children` function prop.

### Benefits

- Provide more intuitive usage that aligns with common React component patterns.
- Allow developers to use the `Controller` component in their preferred way (render prop or children function).
- Maintain parity with other React libraries and provides a better developer experience.

## API Changes

### New properties

- `children`: Added support for using children prop in the `Controller` component.

### Type updates

- `children` prop accepts the same signature as the `render` prop:

```diff
export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> =
- {
-   render: ({
-     field,
-     fieldState,
-     formState,
-   }: {
-     field: ControllerRenderProps<TFieldValues, TName>;
-     fieldState: ControllerFieldState;
-     formState: UseFormStateReturn<TFieldValues>;
-   }) => React.ReactElement;
- }
+ (
+   | {
+       render: ControllerRender<TFieldValues, TName>;
+     }
+   | {
+       children: ControllerRender<TFieldValues, TName>;
+     }
+ )
  & UseControllerProps<TFieldValues, TName, TTransformedValues>;

+ export type ControllerRender<
+   TFieldValues extends FieldValues,
+   TName extends FieldPath<TFieldValues>,
+ > = ({
+   field,
+   fieldState,
+   formState,
+ }: {
+   field: ControllerRenderProps<TFieldValues, TName>;
+   fieldState: ControllerFieldState;
+   formState: UseFormStateReturn<TFieldValues>;
+ }) => React.ReactElement;
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
