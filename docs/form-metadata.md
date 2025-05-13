# Form metadata

## Purpose

This feature allows developers to store custom metadata related to form right inside the form object. This is helpful to centralize and simplify application logic related to a form.

## API Changes

### New properties

- `defaultMetadata`: an object that contains the default metadata for the form. This is used to initialize the form metadata.
- `metadata`: an object that contains the form custom metadata.
- `setMetadata` a mutation method to set the form metadata. This overwrites the existing metadata.
- `updateMetadata`: a mutation method to update the form metadata. This merges the new metadata with the existing metadata.

### Type updates

- New metadata related types:

```ts
type MetadataValue =
  | string
  | number
  | boolean
  | null
  | MetadataValue[]
  | { [key: string]: MetadataValue };

export type FormMetadata = { [key: string]: MetadataValue };

// when user as a generic type parameter
<TMetadata extends FormMetadata = any>
```

- `defaultMetadata` added to `useFormProps`:

```diff
export type UseFormProps<...> = Partial<{
    ...
    delayError: number;
    formControl?: Omit<UseFormReturn<TFieldValues, TContext, TTransformedValues>, 'formState'>;
+   defaultMetadata: FormMetadata;
}>;
```

- `setMetadata`, `updateMetadata` returned as part of the `UseFormReturn` form:

```diff
export type UseFormReturn<...> = {
    ...
    setFocus: UseFormSetFocus<TFieldValues>;
    subscribe: UseFromSubscribe<TFieldValues>;
+   setMetadata: UseFormSetMetadata<TMetadata>;
+   updateMetadata: UseFormUpdateMetadata<TMetadata>;
};
```

- `metadata` added to `formState`:

```diff
export type FormState<TFieldValues extends FieldValues = FieldValues> = {
    ...
    errors: FieldErrors<TFieldValues>;
    isReady: boolean;
+   metadata: TMetadata;
};
```

### Description

To properly use the new form metadata, you first pass an object value with the desired type to the `defaultMetadata`. This will initiate the metadata when the form is created and define the metadata type for the state and mutation methods. The metadata object can have as many properties as necessary, have nested properties, and valid values include strings, numbers, booleans, nulls, arrays, and objects.

You can access the metadata by using the `metadata` property of `formState`, which contains the current metadata for the form. The metadata can be updated using the `setMetadata` and `updateMetadata` mutation methods.
The `setMetadata` method replaces the entire metadata object with the new metadata. The `updateMetadata` method merges the new metadata with the existing metadata. These allow for more flexibility in managing the form metadata.

## Examples

```jsx
import { useForm } from '@bombillazo/rhf-plus';

const defaultMetadata: {
  id: number;
  name: string;
  is_admin: boolean;
} = {
  id: 1,
  name: 'Bob',
  is_admin: true,
};

function App() {
  const form = useForm({ defaultValues });

  return (
    <>
      <form>
        <pre>{JSON.stringify(form.formState.metadata)}</pre>
      </form>
      <Button onClick={() => {
        setMetadata({ id: 100, name: 'Alice', is_admin: false });
        }}
      >Set Metadata</Button>
    </>
  );
}
```
