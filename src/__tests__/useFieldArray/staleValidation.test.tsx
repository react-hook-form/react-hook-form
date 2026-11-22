import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type { Resolver, UseFormReturn } from '../../types';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

type Values = { rows: { value: string }[] };

describe('stale field array validation', () => {
  it.each([
    ['resolver', 'setValue'],
    ['resolver', 'onChange'],
    ['validate', 'setValue'],
    ['validate', 'onChange'],
  ] as const)(
    'ignores a pending %s result after a nested %s',
    async (kind, action) => {
      const pending: (() => void)[] = [];
      let methods!: UseFormReturn<Values>;
      const isInvalid = (rows: Values['rows']) =>
        rows.some((row) => row.value === 'bad');
      const resolver: Resolver<Values> = (values) => {
        const invalid = isInvalid(values.rows);
        return new Promise((resolve) =>
          pending.push(() =>
            resolve(
              invalid
                ? {
                    values: {},
                    errors: {
                      rows: {
                        root: { type: 'validate', message: 'invalid row' },
                      },
                    },
                  }
                : { values, errors: {} },
            ),
          ),
        );
      };

      const App = () => {
        methods = useForm<Values>({
          mode: 'onChange',
          defaultValues: { rows: [{ value: 'bad' }] },
          resolver: kind === 'resolver' ? resolver : undefined,
        });
        const { fields, append } = useFieldArray({
          control: methods.control,
          name: 'rows',
          rules:
            kind === 'validate'
              ? {
                  validate: (rows) => {
                    const invalid = isInvalid(rows);
                    return new Promise<true | string>((resolve) =>
                      pending.push(() =>
                        resolve(invalid ? 'invalid row' : true),
                      ),
                    );
                  },
                }
              : undefined,
        });

        return (
          <>
            {fields.map((field, index) => (
              <input
                key={field.id}
                aria-label={`row${index}`}
                {...methods.register(`rows.${index}.value`)}
              />
            ))}
            <button onClick={() => append({ value: 'ok' })}>append</button>
            <p>{methods.formState.errors.rows?.root?.message}</p>
          </>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByText('append'));

      if (action === 'setValue') {
        act(() => methods.setValue('rows.0.value', 'good'));
      } else {
        fireEvent.change(screen.getByLabelText('row0'), {
          target: { value: 'good' },
        });
      }

      await act(async () => pending[0]());

      expect(screen.queryByText('invalid row')).not.toBeInTheDocument();
    },
  );
});
