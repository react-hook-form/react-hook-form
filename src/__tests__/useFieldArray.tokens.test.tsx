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
  'nested ABA',
  'onChange ABA',
  'equal write',
  'equal onChange',
  'equal array write',
  'equal reset',
  'replace',
  'unrelated field',
  'other array',
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
        if (action === 'onChange ABA') {
          fireEvent.change(screen.getByLabelText('row0'), {
            target: { value: 'good' },
          });
          fireEvent.change(screen.getByLabelText('row0'), {
            target: { value: 'bad' },
          });
        } else {
          act(() => {
            if (action === 'nested ABA') {
              methods.setValue('rows.0.value', 'good');
              methods.setValue('rows.0.value', 'bad');
            } else if (action === 'equal onChange') {
              void methods
                .register('rows.0.value')
                .onChange({
                  target: { name: 'rows.0.value', value: 'bad' },
                  type: 'change',
                });
            } else if (action === 'equal write')
              methods.setValue('rows.0.value', 'bad');
            else if (action === 'equal array write')
              methods.setValue('rows', methods.getValues('rows'));
            else if (action === 'equal reset')
              methods.reset(methods.getValues());
            else if (action === 'replace') replaceRows([{ value: 'good' }]);
            else if (action === 'unrelated field')
              methods.setValue('note', 'changed');
            else methods.setValue('others.0.value', 'changed');
          });
        }
        await act(async () => pending[0]());
        const keep = [
          'equal write',
          'equal onChange',
          'equal array write',
          'unrelated field',
          'other array',
        ].includes(action);
        if (keep) expect(screen.getByText('invalid row')).toBeVisible();
        else expect(screen.queryByText('invalid row')).not.toBeInTheDocument();
        for (const settle of pending.slice(1)) await act(async () => settle());
        expect(screen.getByText('idle')).toBeVisible();
        expect(methods.getValues('others.0.value')).toBe(
          action === 'other array' ? 'changed' : 'other',
        );
      },
    );
  });
});

describe.each(['resolver', 'validate'] as const)(
  'two simultaneously pending arrays with %s',
  (kind) => {
    it.each(['nested change', 'nested ABA'] as const)(
      'only discards the mutated array after %s',
      async (action) => {
        const pending: { name: string; settle: () => void }[] = [];
        let methods!: UseFormReturn<Values>;
        const resolver: Resolver<Values> = (values, _, options) => {
          const name = options.names![0];
          const errors = {
            rows: [{ value: { type: 'validate', message: 'rows invalid' } }],
            others: [
              { value: { type: 'validate', message: 'others invalid' } },
            ],
          };
          return new Promise((resolve) =>
            pending.push({
              name,
              settle: () => resolve({ values: {}, errors }),
            }),
          );
        };
        const App = () => {
          methods = useForm<Values>({
            mode: 'onChange',
            defaultValues: {
              rows: [{ value: 'bad' }],
              others: [{ value: 'bad' }],
              note: '',
            },
            resolver: kind === 'resolver' ? resolver : undefined,
          });
          const rows = useFieldArray({
            control: methods.control,
            name: 'rows',
            rules:
              kind === 'validate'
                ? {
                    validate: () =>
                      new Promise<string>((resolve) =>
                        pending.push({
                          name: 'rows',
                          settle: () => resolve('rows invalid'),
                        }),
                      ),
                  }
                : undefined,
          });
          const others = useFieldArray({
            control: methods.control,
            name: 'others',
            rules:
              kind === 'validate'
                ? {
                    validate: () =>
                      new Promise<string>((resolve) =>
                        pending.push({
                          name: 'others',
                          settle: () => resolve('others invalid'),
                        }),
                      ),
                  }
                : undefined,
          });
          const { errors, isValidating } = methods.formState;
          return (
            <>
              {rows.fields.map((field, i) => (
                <input
                  key={field.id}
                  {...methods.register(`rows.${i}.value`)}
                />
              ))}
              {others.fields.map((field, i) => (
                <input
                  key={field.id}
                  {...methods.register(`others.${i}.value`)}
                />
              ))}
              <button onClick={() => rows.append({ value: 'ok' })}>
                append rows
              </button>
              <button onClick={() => others.append({ value: 'ok' })}>
                append others
              </button>
              <p>
                {errors.rows?.[0]?.value?.message || errors.rows?.root?.message}
              </p>
              <p>
                {errors.others?.[0]?.value?.message ||
                  errors.others?.root?.message}
              </p>
              <p>{isValidating ? 'pending' : 'idle'}</p>
            </>
          );
        };
        render(<App />);
        fireEvent.click(screen.getByText('append rows'));
        fireEvent.click(screen.getByText('append others'));
        expect(pending.map((p) => p.name)).toEqual(['rows', 'others']);
        act(() => {
          methods.setValue('rows.0.value', 'good');
          if (action === 'nested ABA') methods.setValue('rows.0.value', 'bad');
        });
        await act(async () => pending[0].settle());
        expect(screen.queryByText('rows invalid')).not.toBeInTheDocument();
        await act(async () => pending[1].settle());
        expect(screen.getByText('others invalid')).toBeVisible();
        expect(screen.getByText('idle')).toBeVisible();
      },
    );
  },
);
