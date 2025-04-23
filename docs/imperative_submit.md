# Imperative Form Submission

## Purpose

This feature allows for the imperative submission of forms. This is useful in scenarios where you want to trigger form submission from outside the form context, such as from a button click or other event.

## API Changes

### New properties

- `id`: a unique identifier for the form. If not provided, a random ID is generated.
- `submit`: a method to submit the form imperatively.

### Type changes

- `id` added to `useForm` props:

```diff
export type UseFormProps<...> = Partial<{
    ...
    delayError: number;
    formControl?: Omit<UseFormReturn<TFieldValues, TContext, TTransformedValues>, 'formState'>;
+   id: string;
}>;
```

- `id`, `submit` returned as part of the `UseFormReturn` form:

```diff
export type UseFormReturn<...> = {
    ...
    setFocus: UseFormSetFocus<TFieldValues>;
    subscribe: UseFromSubscribe<TFieldValues>;
+   id: string;
+   submit: () => void;
};
```

### Description

Now all forms returned by any RHF API contain an `id` and `submit` function. You may assign a custom unique ID to each form using the `id` option in the `useForm` hook. If no ID is given, a random one is generated. Using the `form.submit()` method you can submit the form imperatively. This is useful when you want to trigger form submission from anywhere in your application (including outside the Form context).
## Examples

```jsx
// Example using the useForm hook
import { useForm } from '@bombillazo/rhf-plus';

function App() {
  const form = useForm({
    id: 'my-form', // uniquely identify the form (optional)
  });

  return (
    <>
      <form
        id={form.id} // assign the form ID to the form element
        onSubmit={form.handleSubmit((data) => console.log(data))}
      >
        <input {...form.register('name')} />
      </form>
      {/* imperatively submit the form */}
      <Button onClick={() => form.submit()}>Submit</Button>
    </>
  );
}
```

```jsx
// Example with Form Context
import { useForm, FormProvider } from '@bombillazo/rhf-plus';

function App() {
  const form = useForm();

  return (
    <FormProvider {...form}>
      <form
        id={form.id}
        onSubmit={form.handleSubmit((data) => console.log(data))}
      >
        <input {...form.register('name')} />
      </form>
      <SubmitButton />
    </FormProvider>
  );
}

function SubmitButton() {
  const form = useFormContext();

  return <Button onClick={() => form.submit()}>Submit</Button>;
}
```

```jsx
// Example using Form Control
import { useForm, createFormControl } from '@bombillazo/rhf-plus';

const fc = createFormControl();

function App() {
  useForm({ formControl: fc.formControl });

  const name = fc.watch('name');

  useEffect(() => {
    if (name === '1234') {
      // imperatively submit the form
      fc.submit();
    }
  }, [name]);

  return (
    <form id={fc.id} onSubmit={fc.handleSubmit((data) => console.log(data))}>
      <input {...fc.register('code')} />
    </form>
  );
}
```
