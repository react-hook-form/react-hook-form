import * as React from 'react';

import { Controller } from '../controller';
import { Path, UseFormReturn } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

test('should not throw type error with path name', () => {
  type MissingCompanyNamePath = Path<{
    test: {
      test: {
        name: string;
      }[];
      testName: string;
    };
  }>;

  const test: MissingCompanyNamePath[] = [
    'test',
    'test.test',
    'test.testName',
    'test.test.0',
    'test.test.0.name',
  ];

  test;
});

test('all APIs except watch are compatible with a superset of FormFields', () => {
  type FormFieldsBig = {
    foo: string;
    bar: 'test1' | 'test2';
    test2: boolean;
  };

  function App() {
    const form = useForm<FormFieldsBig>();
    const test: Omit<UseFormReturn<FormFieldsBig>, 'watch'> = form;
    test;
    return null;
  }
  App;
});

test('should not throw type error with optional array fields', () => {
  type Thing = { id: string; name: string };

  interface FormData {
    name: string;
    things?: Array<{ name: string }>;
    items?: Array<Thing>;
  }

  function App() {
    const { control, register } = useForm<FormData>({
      defaultValues: { name: 'test' },
    });
    const { fields, append } = useFieldArray({ control, name: 'things' });
    const fieldArray = useFieldArray({ control, name: 'items' });

    return (
      <div className="App">
        <input {...register('name')} />

        <button onClick={() => append({ name: '' })}>Add</button>

        {fields.map((field, index) => (
          <div key={field.id}>
            <input {...register(`things.${index}.name`)} />
          </div>
        ))}
        {fieldArray.fields.map((item) => {
          return <div key={item.id}>{item.name}</div>;
        })}
      </div>
    );
  }

  App;
});

test('should work with optional field with Controller', () => {
  type FormValues = {
    firstName: string;
    lastName?: string;
  };

  function App() {
    const { control } = useForm<FormValues>();

    return (
      <div>
        <Controller
          name="firstName"
          defaultValue=""
          control={control}
          render={({ field: { value, onChange } }) => {
            return <input value={value} onChange={onChange} />;
          }}
        />
        <Controller
          name="lastName"
          defaultValue=""
          control={control}
          render={({ field: { value, onChange } }) => {
            return <input value={value} onChange={onChange} />;
          }}
        />
      </div>
    );
  }

  App;
});
