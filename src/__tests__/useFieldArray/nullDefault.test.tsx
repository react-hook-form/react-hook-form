import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

describe('useFieldArray with a null default value', () => {
  it('mounting over a null default must not dirty the form', async () => {
    let snapshot: any = {};
    const Component = () => {
      const { register, control, setValue, getValues, formState } = useForm<{
        name: string;
        listField: { a: string }[] | null;
      }>({
        defaultValues: {
          name: 'a',
          listField: null,
        },
      });
      const { fields } = useFieldArray({
        control,
        name: 'listField',
      });
      // subscribe: reading these in render subscribes the component
      snapshot = {
        values: getValues(),
        isDirty: formState.isDirty,
        dirtyFields: formState.dirtyFields,
        setValue,
        fieldCount: fields.length,
      };
      return (
        <form>
          <input {...register('name')} />
          {fields.map((field, i) => (
            <input key={field.id} {...register(`listField.${i}.a` as const)} />
          ))}
        </form>
      );
    };

    render(<Component />);

    // mount: values must still be null, form pristine
    expect(snapshot.values.listField).toEqual(null);
    expect(snapshot.isDirty).toEqual(false);
    expect(snapshot.dirtyFields).toEqual({});
    expect(snapshot.fieldCount).toEqual(0);

    // touch an unrelated field then revert it
    snapshot.setValue('name', 'b', { shouldDirty: true });

    await waitFor(() => {
      expect(snapshot.isDirty).toEqual(true);
    });

    snapshot.setValue('name', 'a', { shouldDirty: true });

    await waitFor(() => {
      // user never touched listField: form must be clean again
      expect(snapshot.isDirty).toEqual(false);
    });
    expect(snapshot.dirtyFields).toEqual({});
    expect(snapshot.values.listField).toEqual(null);
  });
});
