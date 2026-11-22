import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Resolver, UseFormReturn } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

type Values = {
  rows: { value: string }[];
  others: { value: string }[];
  note: string;
};
const actions = [
  'setValues ABA',
  'equal setValues',
  'unrelated setValues',
  'other array setValues',
  'mixed equal array and unrelated',
] as const;

describe('field array pending result mutation tokens', () => {
  describe.each(['resolver', 'validate'] as const)('%s', (kind) => {
    it.each(actions)(
      'preserves array isolation and invalidates stale results after %s',
      async (action) => {
        const pending: (() => void)[] = [];
        let methods!: UseFormReturn<Values>;
        let replaceRows!: (value: Values['rows']) => void;
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
            defaultValues: {
              rows: [{ value: 'bad' }],
              others: [{ value: 'other' }],
              note: '',
            },
            resolver: kind === 'resolver' ? resolver : undefined,
          });
          const { fields, append, replace } = useFieldArray({
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
          useFieldArray({ control: methods.control, name: 'others' });
          replaceRows = replace;
          const { errors, isValidating } = methods.formState;
          return (
            <>
              {fields.map((field, i) => (
                <input
                  key={field.id}
                  aria-label={`row${i}`}
                  {...methods.register(`rows.${i}.value`)}
                />
              ))}
              <input aria-label="note" {...methods.register('note')} />
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
          const original = methods.getValues('rows');
          if (action === 'setValues ABA') {
            methods.setValues({ rows: [{ value: 'good' }, { value: 'ok' }] });
            methods.setValues({ rows: original });
          } else if (action === 'equal setValues')
            methods.setValues({ rows: original });
          else if (action === 'unrelated setValues')
            methods.setValues({ note: 'changed' });
          else if (action === 'other array setValues')
            methods.setValues({ others: [{ value: 'changed' }] });
          else methods.setValues({ rows: original, note: 'changed' });
        });
        await act(async () => pending[0]());
        const keep = action !== 'setValues ABA';
        if (keep) expect(screen.getByText('invalid row')).toBeVisible();
        else expect(screen.queryByText('invalid row')).not.toBeInTheDocument();
        for (const settle of pending.slice(1)) await act(async () => settle());
        expect(screen.getByText('idle')).toBeVisible();
        expect(methods.getValues('others.0.value')).toBe(
          action === 'other array setValues' ? 'changed' : 'other',
        );
      },
    );
  });
});
