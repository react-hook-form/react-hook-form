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

type Row = { meta: { value: string } };
type Values = {
  section: { rows: Row[]; rowsOther: Row[] };
  note: string;
};
type Kind = 'resolver' | 'validate';
type Request = { message: string; settled: boolean; settle: () => void };
const row = (value: string): Row => ({ meta: { value } });

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

const operations = [
  'append',
  'prepend',
  'insert',
  'remove',
  'swap',
  'move',
  'update',
  'replace',
] as const;
describe.each(['resolver', 'validate'] as const)(
  'new array write-path ownership: %s',
  (kind) => {
    it.each(operations)(
      'new %s result survives completion of an older array request',
      async (operation) => {
        const h = harness(kind);
        act(() => {
          switch (operation) {
            case 'append':
              h.array.append(row('ok'));
              break;
            case 'prepend':
              h.array.prepend(row('ok'));
              break;
            case 'insert':
              h.array.insert(1, row('ok'));
              break;
            case 'remove':
              h.array.remove(0);
              break;
            case 'swap':
              h.array.swap(0, 1);
              break;
            case 'move':
              h.array.move(0, 2);
              break;
            case 'update':
              h.array.update(0, row('ok'));
              break;
            case 'replace':
              h.array.replace([row('ok')]);
              break;
          }
        });
        expect(h.requests.length).toBeGreaterThanOrEqual(2);
        for (const request of h.requests.slice(1)) {
          await act(async () => request.settle());
        }
        const newestErrors = h.errors();
        expect(newestErrors).not.toContain('request 1');
        await act(async () => h.requests[0].settle());
        expect(h.errors()).toBe(newestErrors);
        expect(screen.getByTestId('validating')).toHaveTextContent('idle');
      },
    );
  },
);

const writes = [
  'deep setValue ABA',
  'parent setValue ABA',
  'resetField changed',
  'resetField ABA',
  'reset keepValues',
  'unregister nested value',
] as const;
describe.each(['resolver', 'validate'] as const)(
  'nested API write ownership: %s',
  (kind) => {
    it.each(writes)(
      'late array result cannot overwrite newer explicit error after %s',
      async (write) => {
        const h = harness(kind);
        act(() => {
          switch (write) {
            case 'deep setValue ABA':
              h.methods.setValue('section.rows.0.meta.value', 'good');
              h.methods.setValue('section.rows.0.meta.value', 'bad');
              break;
            case 'parent setValue ABA': {
              const original = h.methods.getValues('section');
              h.methods.setValue('section', {
                ...original,
                rows: [row('good'), row('ok'), row('ok')],
              });
              h.methods.setValue('section', original);
              break;
            }
            case 'resetField changed':
              h.methods.resetField('section.rows.0.meta.value', {
                defaultValue: 'good',
              });
              break;
            case 'resetField ABA':
              h.methods.resetField('section.rows.0.meta.value', {
                defaultValue: 'good',
              });
              h.methods.resetField('section.rows.0.meta.value', {
                defaultValue: 'bad',
              });
              break;
            case 'reset keepValues':
              h.methods.reset(undefined, { keepValues: true });
              break;
            case 'unregister nested value':
              h.methods.unregister('section.rows.0.meta.value');
              break;
          }
        });
        // A newer error is the oracle. Do not merely assert that nothing happened.
        act(() =>
          h.methods.setError('section.rows', {
            type: 'manual',
            message: 'newer explicit error',
          }),
        );
        const newerErrors = h.errors();
        expect(newerErrors).toContain('newer explicit error');
        await act(async () => h.requests[0].settle());
        expect(h.errors()).toBe(newerErrors);
        expect(h.errors()).not.toContain('request 1');
        for (const request of h.requests.slice(1)) {
          if (!request.settled) await act(async () => request.settle());
        }
      },
    );

    it.each(['equal nested value', 'similar-prefix other array'] as const)(
      'retains a legitimate current result after %s',
      async (write) => {
        const h = harness(kind);
        act(() => {
          if (write === 'equal nested value')
            h.methods.setValue('section.rows.0.meta.value', 'bad');
          else h.methods.setValue('section.rowsOther.0.meta.value', 'changed');
        });
        await act(async () => h.requests[0].settle());
        expect(h.errors()).toContain('request 1');
        expect(h.methods.getValues('section.rowsOther.0.meta.value')).toBe(
          write === 'equal nested value' ? 'other' : 'changed',
        );
      },
    );

    it('old array completion cannot restore an error after a newer successful explicit validation', async () => {
      const h = harness(kind);
      act(() => h.methods.setValue('section.rows.0.meta.value', 'good'));
      let validation!: Promise<boolean>;
      act(() => {
        validation = h.methods.trigger();
      });
      expect(h.requests.length).toBeGreaterThanOrEqual(2);
      for (const request of h.requests.slice(1)) {
        await act(async () => request.settle());
      }
      await expect(validation).resolves.toBe(true);
      expect(h.methods.control._formState.isValid).toBe(true);
      expect(h.errors()).toBe('{}');
      await act(async () => h.requests[0].settle());
      expect(h.errors()).toBe('{}');
      expect(h.methods.control._formState.isValid).toBe(true);
    });
  },
);
