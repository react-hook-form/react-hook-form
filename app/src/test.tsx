// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control, UseFormRegister } from '../../src/types';
import { Controller } from '../../src';

let fieldArrayValues: { firstName: string; lastName: string }[] | [] = [];

const App = () => {
  const { register, control } = useForm<{
    test: { firstName: string; lastName: string }[];
  }>({
    defaultValues: {
      test: [
        {
          firstName: 'bill',
          lastName: 'luo',
        },
        {
          firstName: 'bill1',
          lastName: 'luo1',
        },
      ],
    },
  });
  const { fields, update } = useFieldArray({
    name: 'test',
    control,
  });

  fieldArrayValues = fields;

  return (
    <div>
      {fields.map((field, i) => (
        <div key={field.id}>
          <input {...register(`test.${i}.firstName` as const)} />
          <input {...register(`test.${i}.lastName` as const)} />
        </div>
      ))}
      <button
        onClick={() => {
          update(0, { firstName: 'test1', lastName: 'test2' });
          update(1, { firstName: 'test3', lastName: 'test4' });
        }}
      >
        update
      </button>
    </div>
  );
};

export default App;
