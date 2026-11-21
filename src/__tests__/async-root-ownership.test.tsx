import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { createFormControl } from '../logic/createFormControl';
import { useForm } from '../useForm';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('async form validation ownership after reset', () => {
  it.each(['keepValues', 'keepFieldsRef'] as const)(
    'does not resume a pre-reset change after reset with %s',
    async (option) => {
      const validation = deferred<boolean>();
      const form = createFormControl<{ name: string }>({
        mode: 'onChange',
        defaultValues: { name: '' },
        validate: () => validation.promise,
      });
      const field = form.register('name', {
        minLength: { value: 3, message: 'too short' },
      });
      const unsubscribe = form.subscribe({
        formState: { errors: true },
        callback: () => {},
      });
      const pending = field.onChange({
        target: { name: 'name', value: 'a' },
        type: 'change',
      });
      form.reset({ name: 'a' }, { [option]: true });
      expect(form.control._formState.errors).toEqual({});
      validation.resolve(true);
      await pending;
      expect(form.getValues('name')).toBe('a');
      expect(form.control._formState.errors).toEqual({});
      unsubscribe();
    },
  );

  it('keeps reset errors cleared in a mounted form after async form validation', async () => {
    const validation = deferred<boolean>();
    const rootValidate = jest.fn(() => validation.promise);
    function App() {
      const {
        register,
        reset,
        formState: { errors },
      } = useForm<{ name: string }>({
        mode: 'onChange',
        defaultValues: { name: '' },
        validate: rootValidate,
      });
      return (
        <>
          <input
            aria-label="Name"
            {...register('name', {
              minLength: { value: 3, message: 'too short' },
            })}
          />
          <button onClick={() => reset(undefined, { keepValues: true })}>
            reset
          </button>
          <p data-testid="error">{errors.name?.message || 'none'}</p>
        </>
      );
    }
    render(<App />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    expect(rootValidate).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    expect(screen.getByTestId('error')).toHaveTextContent('none');
    await act(async () => {
      validation.resolve(true);
    });
    expect(screen.getByRole('textbox')).toHaveValue('a');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('still validates a normal change after form validation settles', async () => {
    const validation = deferred<boolean>();
    const form = createFormControl<{ name: string }>({
      mode: 'onChange',
      defaultValues: { name: '' },
      validate: () => validation.promise,
    });
    const field = form.register('name', {
      minLength: { value: 3, message: 'too short' },
    });
    const pending = field.onChange({
      target: { name: 'name', value: 'a' },
      type: 'change',
    });
    validation.resolve(true);
    await pending;
    expect(form.control._formState.errors.name?.message).toBe('too short');
  });

  it('still applies a new change started after reset', async () => {
    const validation = deferred<boolean>();
    const rootValidate = jest
      .fn()
      .mockImplementationOnce(() => validation.promise)
      .mockResolvedValue(true);
    const form = createFormControl<{ name: string }>({
      mode: 'onChange',
      defaultValues: { name: '' },
      validate: rootValidate,
    });
    const field = form.register('name', {
      minLength: { value: 3, message: 'too short' },
    });
    const oldChange = field.onChange({
      target: { name: 'name', value: 'a' },
      type: 'change',
    });
    form.reset(undefined, { keepValues: true });
    const newChange = field.onChange({
      target: { name: 'name', value: 'ab' },
      type: 'change',
    });
    await newChange;
    expect(form.control._formState.errors.name?.message).toBe('too short');
    validation.resolve(true);
    await oldChange;
    expect(form.getValues('name')).toBe('ab');
    expect(form.control._formState.errors.name?.message).toBe('too short');
    expect(rootValidate).toHaveBeenCalledTimes(2);
  });

  it('does not revive errors after reset drops the old registration', async () => {
    const validation = deferred<boolean>();
    const form = createFormControl<{ name: string }>({
      mode: 'onChange',
      defaultValues: { name: '' },
      validate: () => validation.promise,
    });
    const field = form.register('name', {
      minLength: { value: 3, message: 'too short' },
    });
    const pending = field.onChange({
      target: { name: 'name', value: 'a' },
      type: 'change',
    });
    form.reset({ name: 'a' });
    validation.resolve(true);
    await pending;
    expect(form.control._formState.errors).toEqual({});
  });
});
