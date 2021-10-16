import * as React from 'react';

import { Path } from '../types';
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

test('should not throw type error with nullable field array ', () => {
  interface FormData {
    name: string;
    things?: Array<{ name: string }>;
  }

  function App() {
    const { control, register } = useForm<FormData>({
      defaultValues: { name: 'test' },
    });
    const { fields, append } = useFieldArray({ control, name: 'things' });

    return (
      <div className="App">
        <input {...register('name')} />

        <button onClick={() => append({ name: '' })}>Add</button>

        {fields.map((field, index) => (
          <div key={field.id}>
            <input
              {...register(`things.${index}.name`)}
              defaultValue={field.name}
            />
          </div>
        ))}
      </div>
    );
  }

  App;
});
