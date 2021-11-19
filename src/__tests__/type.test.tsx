import * as React from 'react';

import { Controller } from '../controller';
import { Path } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { useWatch } from '../useWatch';

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

test('should useWatch return correct array types', () => {
  type FormValues = {
    testString: string;
    testNumber: number;
    testObject: {
      testString: string;
      test1String: string;
    };
  };

  const App = () => {
    const { control } = useForm<FormValues>();
    const output: [
      FormValues['testString'],
      FormValues['testNumber'],
      FormValues['testObject'],
    ] = useWatch({
      control,
      name: ['testString', 'testNumber', 'testObject'],
    });

    return output;
  };

  App;
});
