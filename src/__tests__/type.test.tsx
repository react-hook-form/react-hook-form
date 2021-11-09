import * as React from 'react';

import { Controller } from '../controller';
import { Path, PathValue, UseFormReturn } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

type ComplexTestType = {
  test: {
    testArray: {
      name: string;
    }[];
    testName: string;
    innerTuple: [{ test: string }[], '2', 100];
    simpleTupleDoesntMatch: [123, 'test', 234];
  };
  objArray: { test: string }[];
  tuple: ['test', { innerTest: string }[], 123];
  tupleOfTuples: [[string, number], [222, 333]];
};

test('should not throw type error with path name (Path<T> validation)', () => {
  type MissingCompanyNamePath = Path<ComplexTestType>;
  const test: MissingCompanyNamePath[] = [
    'test',
    'test.testName',
    'test.testArray',
    'test.testArray.0',
    'test.testArray.99999',
    'test.testArray.0.name',
    'test.testArray.99999.name',
    'tuple.2',
  ];

  test;
});

test('validates PathValue scenarios', () => {
  const pathVal: PathValue<ComplexTestType, 'test.testArray'> = [
    { name: 'foo' },
  ];
  pathVal;

  const pathValTest1: PathValue<ComplexTestType, 'test.testArray.0'> = {
    name: 'foo',
  };
  pathValTest1;

  const pathValTest12345: PathValue<ComplexTestType, 'test.testArray.12345'> = {
    name: 'foo',
  };
  pathValTest12345;

  const pathValTestFull: PathValue<ComplexTestType, 'test'> = {
    testArray: [
      {
        name: '123',
      },
    ],
    testName: '234',
    innerTuple: [[{ test: '123' }, { test: '345' }], '2', 100],
    simpleTupleDoesntMatch: [123, 'test', 234],
  };
  pathValTestFull;

  const pathValTestObjArray: PathValue<ComplexTestType, 'objArray'> = [
    { test: '123' },
    { test: '345' },
  ];
  pathValTestObjArray;

  const pathValTupleMatch: PathValue<
    ComplexTestType,
    'test.simpleTupleDoesntMatch.0'
  > = 123;
  pathValTupleMatch;
});

test('all APIs except watch are compatible with a superset of FormFields', () => {
  type FormFieldsSmall = {
    gender: 'female' | 'male';
    firstName: string;
    lastName: string;
  };

  type FormFieldsBig = {
    foo: string;
    bar: 'test1' | 'test2';
    test2: boolean;
  } & FormFieldsSmall;

  function App() {
    const form = useForm<FormFieldsBig>();
    const test: Omit<UseFormReturn<FormFieldsSmall>, 'watch'> = form;
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
