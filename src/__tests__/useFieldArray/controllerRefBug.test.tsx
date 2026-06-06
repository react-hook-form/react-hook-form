import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Controller } from '../../controller';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

let i = 0;

jest.mock('../../logic/generateId', () => () => String(i++));

describe('Controller ref after append+remove with field array rules', () => {
  beforeEach(() => {
    i = 0;
  });

  it('should preserve Controller ref methods after append and remove when rules are provided', async () => {
    let capturedControl: any;

    function Component() {
      const { control } = useForm({
        defaultValues: {
          test: [{ firstName: 'Bill', lastName: 'Luo' }],
        },
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
        rules: { minLength: 4 },
      });

      capturedControl = control;

      return (
        <form>
          <ul>
            {fields.map((item, index) => (
              <li key={item.id}>
                <Controller
                  render={({ field }) => (
                    <input data-testid={`lastName-${index}`} {...field} />
                  )}
                  name={`test.${index}.lastName` as const}
                  control={control}
                />
                <button type="button" onClick={() => remove(index)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => append({ firstName: 'new', lastName: 'entry' })}
          >
            append
          </button>
        </form>
      );
    }

    render(<Component />);

    // After initial mount: _fields.test must be an array
    expect(Array.isArray(capturedControl._fields.test)).toBe(true);

    // And the Controller ref must have proxy methods
    const initialRef = capturedControl._fields.test[0].lastName._f.ref;
    expect(typeof initialRef.focus).toBe('function');
    expect(typeof initialRef.select).toBe('function');

    // Append a new item
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'append' }));
    });

    expect(Array.isArray(capturedControl._fields.test)).toBe(true);

    // Remove the last item
    await act(async () => {
      const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
      fireEvent.click(deleteButtons[1]);
    });

    // _fields.test must still be an array after remove
    expect(Array.isArray(capturedControl._fields.test)).toBe(true);

    // Controller ref methods must still be present after append+remove
    const afterRef = capturedControl._fields.test[0].lastName._f.ref;
    expect(typeof afterRef.focus).toBe('function');
    expect(typeof afterRef.select).toBe('function');
  });
});
