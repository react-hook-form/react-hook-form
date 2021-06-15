// @ts-nocheck
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Control } from '../../src/types';

const App = () => {
  const { control, register, handleSubmit } = useForm<{
    test: {
      yourDetails: {
        firstName: string[];
        lastName: string[];
      };
    }[];
  }>();
  const { fields, append } = useFieldArray({
    control,
    name: 'test',
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log('wtf', data);
      })}
    >
      {fields.map((field, index) => {
        console.log('render...');
        return <div key={field.id} />;
      })}
      <button
        type={'button'}
        onClick={() => {
          append({
            yourDetails: {
              firstName: ['test', 'test1'],
              lastName: ['test', 'test1'],
            },
          });
        }}
      >
        append
      </button>
      <button>submit</button>
    </form>
  );
};

export default App;
