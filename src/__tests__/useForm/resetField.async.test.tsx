import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import type { Resolver, UseFormReturn } from '../../types';
import { useForm } from '../../useForm';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

type Values = { test: string; other: string };

// Every request is released explicitly; no timer controls validation ordering.
describe('resetField with pending validation', () => {
  describe.each(['built-in', 'resolver'] as const)('%s', (kind) => {
    it.each(['trigger', 'all', 'submit', 'change'] as const)(
      'preserves newer errors and pending state after %s validation',
      async (operation) => {
        const requests: ReturnType<typeof deferred<string>>[] = [];
        const check = async () => {
          const request = deferred<string>();
          requests.push(request);
          return request.promise;
        };
        const resolver: Resolver<Values> = async (values) => {
          const message = await check();
          return { values, errors: { test: { type: 'validate', message } } };
        };
        let methods!: UseFormReturn<Values>;
        const App = () => {
          methods = useForm<Values>({
            defaultValues: { test: 'current', other: 'other' },
            mode: 'onChange',
            ...(kind === 'resolver' ? { resolver } : {}),
          });
          const { errors, validatingFields } = methods.formState;
          return (
            <>
              <input
                aria-label="test"
                {...methods.register(
                  'test',
                  kind === 'built-in' ? { validate: check } : {},
                )}
              />
              <p data-testid="error">{errors.test?.message || 'none'}</p>
              <p data-testid="pending">
                {validatingFields.test ? 'pending' : 'idle'}
              </p>
            </>
          );
        };
        render(<App />);
        let old!: Promise<unknown>;
        act(() => {
          if (operation === 'change') {
            fireEvent.change(screen.getByRole('textbox'), {
              target: { value: 'old' },
            });
          } else {
            methods.setValue('test', 'old');
            old =
              operation === 'submit'
                ? methods.handleSubmit(jest.fn())()
                : methods.trigger(operation === 'all' ? undefined : 'test');
          }
        });
        await waitFor(() => expect(requests).toHaveLength(1));
        let fresh!: Promise<boolean>;
        act(() => {
          methods.resetField('test');
          fresh = methods.trigger('test');
        });
        await waitFor(() => expect(requests).toHaveLength(2));
        expect(screen.getByRole('textbox')).toHaveValue('current');
        await act(async () => {
          requests[0].resolve('obsolete');
          await old;
        });
        try {
          expect(screen.getByTestId('error')).toHaveTextContent('none');
          expect(screen.getByTestId('pending')).toHaveTextContent('pending');
        } finally {
          await act(async () => {
            requests[1].resolve('fresh');
            await fresh;
          });
        }
        expect(screen.getByTestId('error')).toHaveTextContent('fresh');
        expect(screen.getByTestId('pending')).toHaveTextContent('idle');
      },
    );

    it.each([false, true])(
      'does not overwrite a completed newer result (keepError=%s)',
      async (keepError) => {
        const requests: ReturnType<typeof deferred<string>>[] = [];
        const check = async () => {
          const request = deferred<string>();
          requests.push(request);
          return request.promise;
        };
        const resolver: Resolver<Values> = async (values) => ({
          values,
          errors: { test: { type: 'validate', message: await check() } },
        });
        const { result } = renderHook(() => {
          const methods = useForm<Values>({
            defaultValues: { test: 'current', other: 'other' },
            ...(kind === 'resolver' ? { resolver } : {}),
          });
          methods.register(
            'test',
            kind === 'built-in' ? { validate: check } : {},
          );
          return { methods, errors: methods.formState.errors };
        });
        let old!: Promise<boolean>;
        let fresh!: Promise<boolean>;
        act(() => {
          result.current.methods.setError('test', {
            type: 'manual',
            message: 'retained',
          });
          old = result.current.methods.trigger('test');
        });
        await waitFor(() => expect(requests).toHaveLength(1));
        act(() => {
          result.current.methods.resetField('test', { keepError });
          fresh = result.current.methods.trigger('test');
        });
        expect(result.current.errors.test?.message).toBe(
          keepError ? 'retained' : undefined,
        );
        await waitFor(() => expect(requests).toHaveLength(2));
        await act(async () => {
          requests[1].resolve('fresh');
          await fresh;
          requests[0].resolve('obsolete');
          await old;
        });
        expect(result.current.errors.test?.message).toBe('fresh');
      },
    );

    it('preserves an unrelated pending result', async () => {
      const requests = {
        test: deferred<string>(),
        other: deferred<string>(),
      };
      const resolver: Resolver<Values> = async (values, _, options) => {
        const name = options.names![0] as keyof Values;
        return {
          values,
          errors: {
            [name]: { type: 'validate', message: await requests[name].promise },
          },
        };
      };
      const { result } = renderHook(() => {
        const methods = useForm<Values>({
          defaultValues: { test: 'current', other: 'other' },
          ...(kind === 'resolver' ? { resolver } : {}),
        });
        for (const name of ['test', 'other'] as const) {
          methods.register(
            name,
            kind === 'built-in'
              ? { validate: async () => requests[name].promise }
              : {},
          );
        }
        return { methods, errors: methods.formState.errors };
      });
      let item!: Promise<boolean>;
      let other!: Promise<boolean>;
      act(() => {
        item = result.current.methods.trigger('test');
        other = result.current.methods.trigger('other');
        result.current.methods.resetField('test');
      });
      await act(async () => {
        requests.test.resolve('obsolete');
        requests.other.resolve('other error');
        await Promise.all([item, other]);
      });
      expect(result.current.errors.test).toBeUndefined();
      expect(result.current.errors.other?.message).toBe('other error');
    });

    it('invalidates descendants without invalidating a similarly named field', async () => {
      type NestedValues = { group: { test: string }; groupOther: string };
      const request = deferred<string>();
      const resolver: Resolver<NestedValues> = async (values) => {
        const message = await request.promise;
        return {
          values,
          errors: {
            group: { test: { type: 'validate', message } },
            groupOther: { type: 'validate', message: 'other error' },
          },
        };
      };
      const { result } = renderHook(() => {
        const methods = useForm<NestedValues>({
          defaultValues: { group: { test: 'current' }, groupOther: 'other' },
          ...(kind === 'resolver' ? { resolver } : {}),
        });
        methods.register(
          'group.test',
          kind === 'built-in' ? { validate: async () => request.promise } : {},
        );
        methods.register(
          'groupOther',
          kind === 'built-in' ? { validate: () => 'other error' } : {},
        );
        return { methods, errors: methods.formState.errors };
      });
      let validation!: Promise<boolean>;
      act(() => {
        validation = result.current.methods.trigger();
        result.current.methods.resetField('group');
      });
      await act(async () => {
        request.resolve('obsolete');
        await validation;
      });
      expect(result.current.errors.group).toBeUndefined();
      expect(result.current.errors.groupOther?.message).toBe('other error');
    });

    it('does not clear newer pending work after reset and re-registration', async () => {
      const requests: ReturnType<typeof deferred<string>>[] = [];
      const check = async () => {
        const request = deferred<string>();
        requests.push(request);
        return request.promise;
      };
      const resolver: Resolver<Values> = async (values) => ({
        values,
        errors: { test: { type: 'validate', message: await check() } },
      });
      const { result } = renderHook(() => {
        const methods = useForm<Values>({
          defaultValues: { test: 'current', other: 'other' },
          ...(kind === 'resolver' ? { resolver } : {}),
        });
        methods.register(
          'test',
          kind === 'built-in' ? { validate: check } : {},
        );
        return {
          methods,
          pending: methods.formState.validatingFields.test,
          errors: methods.formState.errors,
        };
      });
      let old!: Promise<boolean>;
      let fresh!: Promise<boolean>;
      act(() => {
        old = result.current.methods.trigger('test');
      });
      await waitFor(() => expect(requests).toHaveLength(1));
      act(() => {
        result.current.methods.resetField('test');
        result.current.methods.unregister('test');
        result.current.methods.register(
          'test',
          kind === 'built-in' ? { validate: check } : {},
        );
        fresh = result.current.methods.trigger('test');
      });
      await waitFor(() => expect(requests).toHaveLength(2));
      await act(async () => {
        requests[0].resolve('obsolete');
        await old;
      });
      try {
        expect(result.current.pending).toBe(true);
        expect(result.current.errors.test).toBeUndefined();
      } finally {
        await act(async () => {
          requests[1].resolve('fresh');
          await fresh;
        });
      }
      expect(result.current.pending).toBeUndefined();
      expect(result.current.errors.test?.message).toBe('fresh');
    });

    it('keeps a re-registered field authoritative after reset', async () => {
      const request = deferred<string>();
      const resolver: Resolver<Values> = async (values) => ({
        values,
        errors: {
          test: { type: 'validate', message: await request.promise },
        },
      });
      const { result } = renderHook(() => {
        const methods = useForm<Values>({
          defaultValues: { test: 'current', other: 'other' },
          ...(kind === 'resolver' ? { resolver } : {}),
        });
        methods.register(
          'test',
          kind === 'built-in' ? { validate: async () => request.promise } : {},
        );
        return { methods, errors: methods.formState.errors };
      });
      let validation!: Promise<boolean>;
      act(() => {
        validation = result.current.methods.trigger('test');
        result.current.methods.resetField('test');
        result.current.methods.unregister('test');
        result.current.methods.register('test');
        result.current.methods.setError('test', {
          type: 'manual',
          message: 'new registration',
        });
      });
      await act(async () => {
        request.resolve('obsolete');
        await validation;
      });
      expect(result.current.errors.test?.message).toBe('new registration');
    });
  });

  it('does not mutate a resolver-owned error tree when preserving reset fields', async () => {
    const request = deferred<void>();
    const errors = Object.freeze({
      test: Object.freeze({ type: 'validate', message: 'obsolete' }),
    });
    const { result } = renderHook(() => {
      const methods = useForm<Values>({
        defaultValues: { test: 'current', other: 'other' },
        resolver: async (values) => {
          await request.promise;
          return { values, errors };
        },
      });
      methods.register('test');
      return { methods, errors: methods.formState.errors };
    });
    let validation!: Promise<boolean>;
    act(() => {
      validation = result.current.methods.trigger();
      result.current.methods.resetField('test');
    });
    await act(async () => {
      request.resolve();
      await validation;
    });
    expect(result.current.errors.test).toBeUndefined();
    expect(errors.test.message).toBe('obsolete');
  });

  it('does not restore a form-level error computed before field reset', async () => {
    const request = deferred<string>();
    const { result } = renderHook(() => {
      const methods = useForm<Values>({
        defaultValues: { test: 'current', other: 'other' },
        validate: async () => request.promise,
      });
      methods.register('test');
      return { methods, errors: methods.formState.errors };
    });
    let validation!: Promise<boolean>;
    act(() => {
      validation = result.current.methods.trigger();
      result.current.methods.resetField('test');
    });
    await act(async () => {
      request.resolve('obsolete');
      await validation;
    });
    expect(result.current.errors).toEqual({});
  });

  it('does not apply obsolete native custom validity', async () => {
    const request = deferred<string>();
    let methods!: UseFormReturn<{ test: string }>;
    const App = () => {
      methods = useForm({
        defaultValues: { test: 'current' },
        shouldUseNativeValidation: true,
      });
      return (
        <input
          {...methods.register('test', {
            validate: async () => request.promise,
          })}
        />
      );
    };
    render(<App />);
    let validation!: Promise<boolean>;
    act(() => {
      validation = methods.trigger('test');
      methods.resetField('test');
    });
    await act(async () => {
      request.resolve('obsolete');
      await validation;
    });
    expect(
      (screen.getByRole('textbox') as HTMLInputElement).validationMessage,
    ).toBe('');
  });
});
