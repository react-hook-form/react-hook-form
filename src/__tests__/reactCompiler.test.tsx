import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';

import type { UseFormReturn } from '../types';
import { useForm } from '../useForm';
import { FormProvider, useFormContext } from '../useFormContext';

type FormValues = { test: string };

function ChildWithMethods({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <>
      <p>watch: {form.watch('test')}</p>
      <p>errors: {form.formState.errors.test?.message}</p>
      <p>getErrors: {form.getErrors('test')?.message}</p>
    </>
  );
}

function ContextChild() {
  const { watch, getFieldState, formState } = useFormContext<FormValues>();
  return (
    <>
      <p>context watch: {watch('test')}</p>
      <p>context invalid: {String(getFieldState('test', formState).invalid)}</p>
    </>
  );
}

function App() {
  const methods = useForm<FormValues>({ defaultValues: { test: '' } });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => {})}>
        <input
          {...methods.register('test', { required: 'required' })}
          placeholder="test"
        />
        <ChildWithMethods form={methods} />
        <ContextChild />
        <button>submit</button>
      </form>
    </FormProvider>
  );
}

describe('React Compiler compatibility', () => {
  it('should not serve stale values from memoized method calls', async () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText('test'), {
      target: { value: 'abc' },
    });

    expect(await screen.findByText('watch: abc')).toBeVisible();
    expect(screen.getByText('context watch: abc')).toBeVisible();

    fireEvent.change(screen.getByPlaceholderText('test'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('errors: required')).toBeVisible();
    expect(screen.getByText('getErrors: required')).toBeVisible();
    expect(screen.getByText('context invalid: true')).toBeVisible();
  });

  it('should return a new methods object when form state updates', () => {
    const { result } = renderHook(() => {
      const methods = useForm<FormValues>();
      methods.formState.errors;
      return methods;
    });
    const first = result.current;

    act(() => {
      result.current.setError('test', { message: 'error' });
    });

    expect(result.current).not.toBe(first);
    expect(result.current.watch).not.toBe(first.watch);
    expect(result.current.getValues).not.toBe(first.getValues);
    expect(result.current.getErrors).not.toBe(first.getErrors);
    expect(result.current.getFieldState).not.toBe(first.getFieldState);
    expect(result.current.register).not.toBe(first.register);
    expect(result.current.handleSubmit).toBe(first.handleSubmit);
    expect(result.current.setValue).toBe(first.setValue);
    expect(result.current.control).toBe(first.control);
  });

  it('should not nest bound methods across updates', () => {
    const { result } = renderHook(() => {
      const methods = useForm<FormValues>();
      methods.formState.errors;
      return methods;
    });

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.setError('test', { message: `error ${i}` });
      });
    }

    expect(result.current.watch.name).toBe('bound watch');
    expect(result.current.getValues.name).toBe('bound getValues');
  });
});
