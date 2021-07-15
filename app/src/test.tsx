// @ts-nocheck

import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';
import { Controller } from '../../src';

type FormValues = {
  names: {
    name: string;
  }[];
};

const output: object[] = [];

const Component = () => {
  const { control, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      names: [],
    },
  });
  const { fields, append } = useFieldArray({
    control,
    name: 'names',
  });

  const handleAddElement = () => {
    append({ name: 'test' });
  };

  console.log(watch());

  return (
    <form onSubmit={handleSubmit(() => {})}>
      {fields.map((item, index) => {
        return (
          <div key={item.id}>
            <Controller
              control={control}
              name={`names.${index}.name` as const}
              render={({ field }) => <input {...field} />}
            />
          </div>
        );
      })}
      <button type="button" onClick={handleAddElement}>
        Append
      </button>
    </form>
  );
};

export default Component;
