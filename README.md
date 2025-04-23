<div align="center">
  <img src="./docs/logo.png" alt="RHF Plus Logo" />
</div>

<div align="center">

[![npm downloads](https://img.shields.io/npm/dm/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/dt/@bombillazo/rhf-plus.svg?style=for-the-badge)](https://www.npmjs.com/package/@bombillazo/rhf-plus)
[![npm](https://img.shields.io/npm/l/@bombillazo/rhf-plus?style=for-the-badge)](https://github.com/bombillazo/rhf-plus/blob/master/LICENSE)

</div>

RHF+ (`rhf-plus`) is a fork of [react-hook-form](https://react-hook-form.com/) (**RHF**) with some feature enhancements. It is designed to be a drop-in replacement for RHF, so you can use it in your existing projects without any changes.

### Install

```sh
npm install @bombillazo/rhf-plus
```

## Enhancements

### Imperative Form Submission

New properties:

- `id`: a unique identifier for the form. If not provided, a random ID is generated.
- `submit`: a method to submit the form imperatively.

API Changes:

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

Now all forms returned by any RHF API contains an `id` and `submit` function. You may assign a custom unique ID to each form using the `id` option in the `useForm` hook. If no ID is given, a random one is generated. Using the `form.submit()` method you can submit the form imperatively . This is useful when you want to trigger form submission from anywhere in your application (including outside the Form context).

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
      <Button onClick={() => form.submit()}>
        Submit
      </Button>
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

  return (
    <Button onClick={() => form.submit()}>
      Submit
    </Button>
  );
}
```

```jsx
// Example using Form Control
import { useForm, createFormControl } from '@bombillazo/rhf-plus';


const fc = createFormControl()

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

      <form 
        id={fc.id}
        onSubmit={fc.handleSubmit((data) => console.log(data))}
      >
        <input {...fc.register('code')} />
      </form>
  );
}
```

1. **Form-level custom metadata** : You can add custom metadata to the form using the `form` object returned by the `useForm` hook. This is useful when you want to store additional information related to the form.

### Versioning

Even though we are enhancing RHF, `rhf-plus` aims to follow the original RHF package as closely as possible. Our focus will be on:

- adding new enhancements
- keeping this library synced with the `latest` RHF version

To make versioning simple, `rhf-plus` follows these versioning rules:

- `rhf-plus` versions are based on the `latest` existing RHF version to which the enhancements are applied (e.g., `7.5.0`).
- `rhf-plus` versions are suffixed with `-plus.x`, staring with index `0`.
  - For example, the first version of `rhf-plus` based on RHF `7.5.0` will be `7.5.0-plus.0`.
- The `-plus.x` suffix is incremented with each new release of `rhf-plus`.
  - For example, if the latest RHF version the second version of `rhf-plus` based on RHF `7.5.0` will be `7.5.0-plus.1`.
- The `-plus.x` suffix is reset to `0` when a new version of RHF is released.

#### Out of Scope

Here is a list of things we will **NOT** do:

- **Support older RHF versions**:  As new enhancements come in, they will only be applied to the current and latest RHF version. This is to ensure that we are closely synced to RHF and to reduce the overhead of maintaining multiple versions of `rhf-plus`.
- **Fix RHF bugs**: Those are the responsibility of the RHF team. We will only focus on fixing bugs in `rhf-plus` that are related to our enhancements. Once RHF fixes a bug, we will roll them into `rhf-plus` when we sync versions.
- **Add unrelated RHF features**: This is to ensure that we are not diverging too much from the original RHF package and are not creating a separate library.


### Contributors

Thanks go to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].
