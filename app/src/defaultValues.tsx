import React from 'react';
import { NestedValue, useForm } from 'react-hook-form';

function DefaultValues() {
  const { register } = useForm<{
    test: string;
    test1: {
      firstName: string;
      lastName: string[];
      deep: {
        nest: string;
      };
    };
    checkbox: NestedValue<string[]>;
  }>({
    defaultValues: {
      test: 'test',
      checkbox: ['1', '2'],
      test1: {
        firstName: 'firstName',
        lastName: ['lastName0', 'lastName1'],
        deep: {
          nest: 'nest',
        },
      },
    },
  });

  return (
    <form>
      <input {...register('test')} />
      <input {...register('test1.firstName')} />
      <input {...register('test1.deep.nest')} />
      <input {...register('test1.deep.nest')} />
      <input {...register('test1.lastName.0')} />
      <input {...register('test1.lastName.1')} />
      <input type="checkbox" value={'1'} {...register('checkbox')} />
      <input type="checkbox" value={'2'} {...register('checkbox')} />
    </form>
  );
}

export default DefaultValues;
