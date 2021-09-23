// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';
import { Controller } from '../../src';

export default () => {
  const {
    control,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
  });
  const test = watch('test');

  return (
    <div>
      <p>{isValid ? 'valid' : 'invalid'}</p>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <select {...field} data-testid="select">
            <option value={''}></option>
            <option value={'test'}>test</option>
            <option value={'test1'}>test1</option>
          </select>
        )}
        name={'test'}
      />

      {test === 'test1' && (
        <>
          <Controller
            control={control}
            render={({ field }) => <input {...field} />}
            rules={{ required: true }}
            name={'first.test'}
          />
          <Controller
            control={control}
            render={({ field }) => <input {...field} />}
            rules={{ required: true }}
            name={'first.test1'}
          />
        </>
      )}
    </div>
  );
};
