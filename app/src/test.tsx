// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';
import { Controller } from '../../src';

export default function App() {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      nest: {
        test: [
          { value: '1', nestedArray: [{ value: '2' }] },
          { value: '3', nestedArray: [{ value: '4' }] },
        ],
      },
    },
  });
  const { fields, remove } = useFieldArray({
    name: 'test',
    control,
  });

  React.useEffect(() => {
    setTimeout(() => {
      reset({
        test: [
          {
            title: 'title1',
            description: 'description1',
          },
          {
            title: 'title2',
            description: 'description2',
          },
        ],
      });
    }, 1000);
  }, [reset]);

  return (
    <form onSubmit={handleSubmit((data) => console.log('data', data))}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <Controller
            name={`test.${index}.title`}
            control={control}
            render={({ field }) => <input {...field} />}
          />
          <button type="button" onClick={() => remove(index)}>
            remove
          </button>
        </div>
      ))}
      <button type="submit">submit</button>
    </form>
  );
}
