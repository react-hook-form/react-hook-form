import React from 'react';
import { useForm } from 'react-hook-form';

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
  }>({
    defaultValues: {
      test: 'test',
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
    </form>
  );
}

export default DefaultValues;
