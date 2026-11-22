import React from 'react';
import { act, render, screen } from '@testing-library/react';

import type {
  Resolver,
  ResolverResult,
  UseFieldArrayReturn,
  UseFormReturn,
} from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

type Row = {
  meta: {
    value: string;
    spare?: string | undefined;
    absent?: string;
    empty?: { leaf?: string };
  };
};
type Values = {
  section: { rows: Row[]; rowsOther: Row[] };
  note: string;
};
type Kind = 'resolver' | 'validate';
type Request = { message: string; settled: boolean; settle: () => void };
const row = (value: string): Row => ({
  meta: { value, spare: undefined, empty: {} },
});

function harness(kind: Kind) {
  const requests: Request[] = [];
  let methods!: UseFormReturn<Values>;
  let array!: UseFieldArrayReturn<Values, 'section.rows'>;
  const defer = <T,>(message: string, answer: T) =>
    new Promise<T>((resolve) => {
      const request: Request = {
        message,
        settled: false,
        settle: () => {
          expect(request.settled).toBe(false);
          request.settled = true;
          resolve(answer);
        },
      };
      requests.push(request);
    });
  const resolver: Resolver<Values> = (values) => {
    const invalid = values.section.rows.some((r) => r.meta?.value === 'bad');
    const message = `request ${requests.length + 1}`;
    return defer<ResolverResult<Values>>(message, {
      values: invalid ? {} : values,
      errors: invalid
        ? {
            section: {
              rows: [{ meta: { value: { type: 'validate', message } } }],
            },
          }
        : {},
    });
  };
  function App() {
    methods = useForm<Values>({
      mode: 'onChange',
      defaultValues: {
        section: { rows: [row('bad'), row('ok')], rowsOther: [row('other')] },
        note: '',
      },
      resolver: kind === 'resolver' ? resolver : undefined,
    });
    array = useFieldArray({
      control: methods.control,
      name: 'section.rows',
      rules:
        kind === 'validate'
          ? {
              validate: (rows) => {
                const invalid = rows.some((r) => r.meta?.value === 'bad');
                const message = `request ${requests.length + 1}`;
                return defer(message, invalid ? message : true);
              },
            }
          : undefined,
    });
    useFieldArray({ control: methods.control, name: 'section.rowsOther' });
    React.useEffect(() => {
      // Programmatic registration is deliberate: unregister must not be undone
      // by rendering the same input again before the old promise completes.
      methods.register('section.rows.0.meta.value');
    }, []);
    const { errors, isValidating } = methods.formState;
    const error = errors.section?.rows;
    return (
      <>
        <output data-testid="errors">
          {JSON.stringify({
            message: error?.message,
            root: error?.root?.message,
            first: error?.[0]?.meta?.value?.message,
          })}
        </output>
        <output data-testid="validating">
          {isValidating ? 'pending' : 'idle'}
        </output>
      </>
    );
  }
  render(<App />);
  expect(requests).toHaveLength(0);
  act(() => array.append(row('ok')));
  expect(requests).toHaveLength(1);
  return {
    methods,
    array,
    requests,
    errors: () => screen.getByTestId('errors').textContent,
  };
}

const edges = [
  'nested keepValue',
  'array-root keepValue',
  'genuinely absent leaf',
  'similarly-prefixed other array',
  'own undefined value removed',
  'empty ancestor pruned for absent leaf',
  'array root unregister then same-reference bulk restore',
  'array root removed',
] as const;

describe.each(['resolver', 'validate'] as const)(
  'unregister mutation boundaries: %s',
  (kind) => {
    it.each(edges)(
      'preserves the correct request owner after %s',
      async (edge) => {
        const h = harness(kind);
        const original = h.methods.getValues('section.rows');
        const others = h.methods.getValues('section.rowsOther');
        expect(
          Object.prototype.hasOwnProperty.call(original[0].meta, 'spare'),
        ).toBe(true);
        expect(
          Object.prototype.hasOwnProperty.call(original[0].meta, 'empty'),
        ).toBe(true);
        act(() => {
          switch (edge) {
            case 'nested keepValue':
              h.methods.unregister('section.rows.0.meta.value', {
                keepValue: true,
              });
              break;
            case 'array-root keepValue':
              h.methods.unregister('section.rows', { keepValue: true });
              break;
            case 'genuinely absent leaf':
              h.methods.unregister('section.rows.0.meta.absent');
              break;
            case 'similarly-prefixed other array':
              h.methods.unregister('section.rowsOther.0.meta.value');
              break;
            case 'own undefined value removed':
              h.methods.unregister('section.rows.0.meta.spare');
              expect(
                Object.prototype.hasOwnProperty.call(original[0].meta, 'spare'),
              ).toBe(false);
              expect(h.methods.getValues('section.rows')).toBe(original);
              break;
            case 'empty ancestor pruned for absent leaf':
              h.methods.unregister('section.rows.0.meta.empty.leaf');
              expect(
                Object.prototype.hasOwnProperty.call(original[0].meta, 'empty'),
              ).toBe(false);
              expect(h.methods.getValues('section.rows')).toBe(original);
              break;
            case 'array root unregister then same-reference bulk restore':
              h.methods.unregister('section.rows');
              h.methods.setValues({
                section: { rows: original, rowsOther: others },
              });
              expect(h.methods.getValues('section.rows')).toBe(original);
              break;
            case 'array root removed':
              h.methods.unregister('section.rows');
              break;
          }
        });
        const keep = [
          'nested keepValue',
          'array-root keepValue',
          'genuinely absent leaf',
          'similarly-prefixed other array',
        ].includes(edge);
        if (!keep)
          act(() =>
            h.methods.setError('section.rows', {
              type: 'manual',
              message: 'newer explicit error',
            }),
          );
        const before = h.errors();
        await act(async () => h.requests[0].settle());
        if (keep) {
          expect(h.errors()).toContain('request 1');
          expect(h.methods.getValues('section.rows.0.meta.value')).toBe('bad');
        } else {
          expect(before).toContain('newer explicit error');
          expect(h.errors()).toBe(before);
          expect(h.errors()).not.toContain('request 1');
        }
        for (const request of h.requests.slice(1)) {
          if (!request.settled) await act(async () => request.settle());
        }
      },
    );
  },
);
