import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';

import { createFormControl } from '../../logic/createFormControl';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';
import { FormProvider, useFormContext } from '../../useFormContext';

describe('getErrors', () => {
  it('should return the entire errors object without an argument', () => {
    const { result } = renderHook(() =>
      useForm<{ foo: string; bar: string }>(),
    );

    act(() => {
      result.current.setError('foo', { type: 'required', message: 'foo err' });
      result.current.setError('bar', { type: 'required', message: 'bar err' });
    });

    expect(result.current.getErrors()).toEqual({
      foo: { type: 'required', message: 'foo err', ref: undefined },
      bar: { type: 'required', message: 'bar err', ref: undefined },
    });
  });

  it('should return a single field error', () => {
    const { result } = renderHook(() => useForm<{ foo: string }>());

    act(() => {
      result.current.setError('foo', { type: 'required', message: 'foo err' });
    });

    expect(result.current.getErrors('foo')).toEqual({
      type: 'required',
      message: 'foo err',
      ref: undefined,
    });
  });

  it('should return errors in the requested order, including missing entries', () => {
    const { result } = renderHook(() =>
      useForm<{ foo: string; bar: string; baz: string }>(),
    );

    act(() => {
      result.current.setError('foo', { type: 'required' });
      result.current.setError('bar', { type: 'min' });
    });

    expect(result.current.getErrors(['foo', 'baz', 'bar'])).toEqual([
      { type: 'required', ref: undefined },
      undefined,
      { type: 'min', ref: undefined },
    ]);
  });

  it('should return undefined when no error is stored for a path', () => {
    const { result } = renderHook(() => useForm<{ foo: string }>());

    expect(result.current.getErrors('foo')).toBeUndefined();
  });

  it('should return stored errors without running validation', async () => {
    const { result } = renderHook(() =>
      useForm<{ foo: string }>({ mode: 'onSubmit' }),
    );
    const validate = jest.fn(() => 'required');

    result.current.register('foo', { validate });

    expect(result.current.getErrors()).toEqual({});
    expect(validate).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.trigger();
    });

    expect(validate).toHaveBeenCalledTimes(1);
    expect(result.current.getErrors('foo')).toEqual(
      expect.objectContaining({ type: 'validate', message: 'required' }),
    );
  });

  it('should reflect the setError -> getErrors -> clearErrors -> getErrors transition', () => {
    const { result } = renderHook(() => useForm<{ foo: string }>());

    act(() => {
      result.current.setError('foo', { type: 'required' });
    });
    expect(result.current.getErrors('foo')).toEqual({
      type: 'required',
      ref: undefined,
    });

    act(() => {
      result.current.clearErrors();
    });
    expect(result.current.getErrors()).toEqual({});
  });

  describe('global errors', () => {
    it('should include root and form global errors', () => {
      const { result } = renderHook(() => useForm<{ foo: string }>());

      act(() => {
        result.current.setError('root.server', {
          type: 'server',
          message: 'server down',
        });
        result.current.setError('form', {
          type: 'form',
          message: 'form error',
        });
      });

      expect(result.current.getErrors('root.server')).toEqual(
        expect.objectContaining({ type: 'server', message: 'server down' }),
      );
      expect(result.current.getErrors('form')).toEqual(
        expect.objectContaining({ type: 'form', message: 'form error' }),
      );
    });

    it('should read a nested form error via its full path', () => {
      const { result } = renderHook(() => useForm<{ foo: string }>());

      act(() => {
        result.current.setError('form.custom', {
          type: 'server',
          message: 'x',
        });
      });

      expect(result.current.getErrors('form.custom')).toEqual(
        expect.objectContaining({ type: 'server', message: 'x' }),
      );
    });
  });

  describe('nested and array field paths', () => {
    it('should return the nested error tree for a parent object path', () => {
      const { result } = renderHook(() =>
        useForm<{ user: { name: string } }>(),
      );

      act(() => {
        result.current.setError('user.name', { type: 'required' });
      });

      expect(result.current.getErrors('user')).toEqual({
        name: { type: 'required', ref: undefined },
      });
    });

    it('should return the nested error tree for an array parent path', () => {
      const { result } = renderHook(() =>
        useForm<{ items: { name: string }[] }>(),
      );

      act(() => {
        result.current.setError('items.0.name', { type: 'required' });
      });

      expect(result.current.getErrors('items')).toEqual([
        { name: { type: 'required', ref: undefined } },
      ]);
      expect(result.current.getErrors('items')).toEqual(
        result.current.getFieldState('items').error,
      );
    });
  });

  it('should not re-render a component that only calls getErrors when setError fires', () => {
    let renderCount = 0;
    let setError!: ReturnType<typeof useForm<{ foo: string }>>['setError'];
    let getErrors!: ReturnType<typeof useForm<{ foo: string }>>['getErrors'];

    const Reader = () => {
      renderCount++;
      const methods = useForm<{ foo: string }>();
      setError = methods.setError;
      getErrors = methods.getErrors;
      // read via getErrors only — no formState subscription
      getErrors();
      return null;
    };

    render(<Reader />);

    const before = renderCount;

    act(() => {
      setError('foo', { type: 'required' });
    });

    // no subscription to formState.errors => no re-render
    expect(renderCount).toBe(before);
    // but the error is still readable on demand
    expect(getErrors('foo')).toEqual({ type: 'required', ref: undefined });
  });

  it('should expose getErrors on createFormControl and its formControl', () => {
    const formControl = createFormControl<{ foo: string }>();

    expect(typeof formControl.getErrors).toBe('function');
    expect(typeof formControl.formControl.getErrors).toBe('function');

    formControl.setError('foo', { type: 'required' });
    expect(formControl.getErrors('foo')).toEqual({
      type: 'required',
      ref: undefined,
    });
    expect(formControl.formControl.getErrors('foo')).toEqual({
      type: 'required',
      ref: undefined,
    });

    formControl.clearErrors();
    expect(formControl.getErrors()).toEqual({});
  });

  it('should expose getErrors through FormProvider and useFormContext at runtime', () => {
    const Child = () => {
      const { getErrors, setError } = useFormContext<{ foo: string }>();
      const [shown, setShown] = React.useState('none');
      return (
        <button
          type="button"
          onClick={() => {
            setError('foo', { type: 'required', message: 'ctx error' });
            setShown(getErrors('foo')?.message ?? 'none');
          }}
        >
          {shown}
        </button>
      );
    };

    const App = () => {
      const methods = useForm<{ foo: string }>();
      return (
        <FormProvider {...methods}>
          <Child />
        </FormProvider>
      );
    };

    render(<App />);
    expect(screen.getByRole('button')).toHaveTextContent('none');

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('button')).toHaveTextContent('ctx error');
  });

  it('should protect internal errors from top-level mutations', () => {
    const { result } = renderHook(() => useForm<{ foo: string }>());

    act(() => {
      result.current.setError('foo', { type: 'required' });
    });

    const errors = result.current.getErrors();
    delete errors.foo;

    expect(result.current.getErrors('foo')).toEqual({
      type: 'required',
      ref: undefined,
    });
  });

  it('should read a field-array root error', async () => {
    type FormValues = { items: { name: string }[] };
    const { result } = renderHook(() => {
      const form = useForm<FormValues>({ defaultValues: { items: [] } });
      useFieldArray({
        control: form.control,
        name: 'items',
        rules: { required: 'at least one item is required' },
      });
      return form;
    });

    await act(async () => {
      await result.current.trigger('items');
    });

    // Field-array validation stores an array-level error under `.root`.
    const itemsError = result.current.getErrors('items');
    expect(itemsError?.root?.message).toBe('at least one item is required');
  });
});
