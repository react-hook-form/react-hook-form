import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';

let outputData: object = {};
let watchedData: object[] = [];

const Component = () => {
  const { register, handleSubmit, watch } = useForm<{
    test?: string;
    test1?: string;
    test2?: string;
    test3?: string;
    test4: string;
  }>();

  watchedData.push(watch());

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log(data)
        outputData = data;
      })}
    >
      <input {...register('test')} disabled />
      <input
        disabled={true}
        value={'test'}
        type={'checkbox'}
        {...register('test1')}
      />
      <input
        disabled={true}
        value={'test'}
        type={'radio'}
        {...register('test2')}
      />
      <select {...register('test3')} disabled />
      <input {...register('test4')} data-testid={'input'} />
      <button>Submit</button>
    </form>
  );
};

export default Component;
