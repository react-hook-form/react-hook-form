// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';
import { Controller } from '../../src';

const App = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      test: [{ firstName: 'test' }],
    },
  });
  const { fields, prepend } = useFieldArray({
    control,
    name: 'test',
  });
  console.log('errors', errors);

  return (
    <form onSubmit={handleSubmit(() => {})}>
      {fields.map((field, index) => {
        return (
          <div key={field.id}>
            <Controller
              control={control}
              render={({ field }) => <input {...field} />}
              name={`test.${index}.firstName`}
              rules={{ required: true }}
            />
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          prepend({
            firstName: '',
          })
        }
      >
        prepend
      </button>
      <button>submit</button>
    </form>
  );
};

export default App;
