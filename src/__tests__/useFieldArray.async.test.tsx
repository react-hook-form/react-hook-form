import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import type { Resolver, UseFormReturn } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

type Values = { rows: { value: string }[] };

describe('field array async validation snapshots', () => {
  it.each([
    ['resolver', 'edit'],
    ['validate', 'edit'],
    ['resolver', 'reset'],
    ['validate', 'reset'],
  ] as const)(
    'drops a pending %s result after a nested %s',
    async (kind, action) => {
      const pending: (() => void)[] = [];
      let methods!: UseFormReturn<Values>;
      const resolver: Resolver<Values> = (values) => {
        const invalid = values.rows.some((row) => row.value === 'bad');
        return new Promise((resolve) =>
          pending.push(() =>
            resolve({
              values: invalid ? {} : values,
              errors: invalid
                ? {
                    rows: [
                      { value: { type: 'validate', message: 'invalid row' } },
                    ],
                  }
                : {},
            }),
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
                    const invalid = rows.some((row) => row.value === 'bad');
                    return new Promise<true | string>((resolve) =>
                      pending.push(() =>
                        resolve(invalid ? 'invalid row' : true),
                      ),
                    );
                  },
                }
              : undefined,
        });
        const { errors, isValidating } = methods.formState;
        return (
          <>
            {fields.map((field, index) => (
              <input
                key={field.id}
                {...methods.register(`rows.${index}.value`)}
              />
            ))}
            <button onClick={() => append({ value: 'ok' })}>append</button>
            <p>
              {errors.rows?.[0]?.value?.message || errors.rows?.root?.message}
            </p>
            <p>{isValidating ? 'pending' : 'idle'}</p>
          </>
        );
      };
      render(<App />);
      fireEvent.click(screen.getByText('append'));
      expect(pending).toHaveLength(1);
      act(() => {
        if (action === 'reset') {
          methods.reset({ rows: [{ value: 'bad' }, { value: 'ok' }] });
        } else {
          methods.setValue('rows.0.value', 'good');
        }
      });
      await act(async () => pending[0]());
      expect(screen.queryByText('invalid row')).not.toBeInTheDocument();
      expect(screen.getByText('idle')).toBeVisible();
    },
  );

  it.each([
    'change',
    'equal reset',
    'equal write',
    'unchanged',
    'replacement',
  ] as const)(
    'preserves the resolver result contract after %s',
    async (action) => {
      const pending: (() => void)[] = [];
      let methods!: UseFormReturn<Values>;
      const resolver: Resolver<Values> = (values) => {
        const invalid = values.rows.some((row) => row.value === 'bad');
        return new Promise((resolve) =>
          pending.push(() =>
            resolve({
              values: invalid ? {} : values,
              errors: invalid
                ? {
                    rows: [
                      { value: { type: 'validate', message: 'invalid row' } },
                    ],
                  }
                : {},
            }),
          ),
        );
      };
      const App = () => {
        methods = useForm<Values>({
          mode: 'onChange',
          defaultValues: { rows: [{ value: 'bad' }] },
          resolver,
        });
        const { fields, append } = useFieldArray({
          control: methods.control,
          name: 'rows',
        });
        const { errors, isValidating } = methods.formState;
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
            <p>{errors.rows?.[0]?.value?.message}</p>
            <p>{isValidating ? 'pending' : 'idle'}</p>
          </>
        );
      };
      render(<App />);
      fireEvent.click(screen.getByText('append'));
      expect(pending).toHaveLength(1);
      if (action === 'change') {
        fireEvent.change(screen.getByLabelText('row0'), {
          target: { value: 'good' },
        });
        expect(pending).toHaveLength(2);
        await act(async () => pending[1]());
        expect(screen.queryByText('invalid row')).not.toBeInTheDocument();
      } else if (action === 'equal reset') {
        act(() => methods.reset({ rows: [{ value: 'bad' }, { value: 'ok' }] }));
      } else if (action === 'equal write') {
        act(() => methods.setValue('rows.0.value', 'bad'));
      } else if (action === 'replacement') {
        act(() => methods.setValue('rows', [{ value: 'good' }]));
      }
      await act(async () => pending[0]());
      if (action === 'equal write' || action === 'unchanged') {
        expect(screen.getByText('invalid row')).toBeVisible();
      } else {
        expect(screen.queryByText('invalid row')).not.toBeInTheDocument();
      }
      for (const settle of pending.slice(1)) {
        await act(async () => settle());
      }
      expect(screen.getByText('idle')).toBeVisible();
    },
  );
});
