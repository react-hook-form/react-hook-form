import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { FieldArray } from '../fieldArray';
import { useForm } from '../useForm';

type FormValues = {
  test: { value: string }[];
};

describe('FieldArray', () => {
  it('pass the useFieldArray return value to the render prop', () => {
    const App = () => {
      const { control, register } = useForm<FormValues>({
        defaultValues: { test: [{ value: 'one' }, { value: 'two' }] },
      });

      return (
        <FieldArray
          control={control}
          name="test"
          render={({ fields }) => (
            <>
              {fields.map((field, index) => (
                <input
                  key={field.id}
                  {...register(`test.${index}.value` as const)}
                />
              ))}
            </>
          )}
        />
      );
    };

    render(<App />);

    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('one');
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('two');
  });

  it('update the rendered rows when the render prop appends and removes', () => {
    const App = () => {
      const { control, register } = useForm<FormValues>({
        defaultValues: { test: [{ value: 'one' }] },
      });

      return (
        <FieldArray
          control={control}
          name="test"
          render={({ fields, append, remove }) => (
            <>
              {fields.map((field, index) => (
                <input
                  key={field.id}
                  {...register(`test.${index}.value` as const)}
                />
              ))}
              <button type="button" onClick={() => append({ value: 'added' })}>
                append
              </button>
              <button type="button" onClick={() => remove(0)}>
                remove
              </button>
            </>
          )}
        />
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('added');

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('added');
  });

  it('forward keyName to useFieldArray', () => {
    let keys: string[] = [];

    const App = () => {
      const { control } = useForm<FormValues>({
        defaultValues: { test: [{ value: 'one' }] },
      });

      return (
        <FieldArray
          control={control}
          name="test"
          keyName="customId"
          render={({ fields }) => {
            keys = fields.map((field) => field.customId);
            return <p>{fields.length}</p>;
          }}
        />
      );
    };

    render(<App />);

    expect(screen.getByText('1')).toBeVisible();
    expect(keys).toHaveLength(1);
    expect(typeof keys[0]).toBe('string');
  });
});
