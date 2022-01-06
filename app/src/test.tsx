import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';

const App = () => {
  const { register, control } = useForm<{
    test: { value: string }[];
  }>({
    defaultValues: {
      test: [
        {
          value: 'bill',
        },
      ],
    },
  });
  const { fields, update } = useFieldArray({
    name: 'test',
    control,
  });

  return (
    <div>
      {fields.map((field, i) => (
        <div key={field.id}>
          <input {...register(`test.${i}.value` as const)} />
        </div>
      ))}
      <button onClick={() => update(0, { value: 'test' })}>update</button>
    </div>
  );
};

export default App;
