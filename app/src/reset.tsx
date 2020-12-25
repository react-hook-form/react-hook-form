import React from 'react';
import { useForm } from 'react-hook-form';

function Reset() {
  const { register, reset } = useForm<{
    firstName: string;
    lastName: string;
    objectData: {
      test: string;
    };
    array: string[];
    deepNest: {
      level1: {
        level2: {
          data: string;
        };
      };
    };
  }>();
  return (
    <>
      <input name="firstName" {...register('firstName')} />
      <input name="array.1" {...register('array.1')} />
      <input name="objectData.test" {...register('objectData.test')} />
      <input name="lastName" {...register('lastName')} />
      <input name="deepNest.level1.level2.data" {...register('deepNest.level1.level2.data')} />
      <button
        type="button"
        onClick={() =>
          reset({
            firstName: 'bill',
            lastName: 'luo',
            array: ['', 'test'],
            objectData: { test: 'data' },
            deepNest: {
              level1: {
                level2: {
                  data: 'hey',
                },
              },
            },
          })
        }
      >
        button
      </button>
    </>
  );
}

export default Reset;
