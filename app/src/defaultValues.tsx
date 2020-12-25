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
      <input name="test" {...register('test')} />
      <input name="test1.firstName" {...register('test1.firstName')} />
      <input name="test1.deep.nest" {...register('test1.deep.nest')} />
      <input
        name="test1.deep.nest"
        {...register('test1.deep.nest')}
      />
      <input name="test1.lastName.0" {...register('test1.lastName.0')} />
      <input name="test1.lastName.1" {...register('test1.lastName.1')} />
    </form>
  );
}

export default DefaultValues;
