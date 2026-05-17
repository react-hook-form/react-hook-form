import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';

import { Controller } from '../../controller';
import { useForm } from '../../useForm';

describe('setValues', () => {
  it('should batch update multiple values', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    await act(async () => {
      result.current.setValues({
        a: '10',
        b: '20',
      });
    });

    expect(result.current.getValues()).toEqual({
      a: '10',
      b: '20',
    });
  });

  it('should support function updater', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    await act(async () => {
      result.current.setValues((values) => ({
        a: values.a + 'x',
        b: values.b + 'y',
      }));
    });

    expect(result.current.getValues()).toEqual({
      a: '1x',
      b: '2y',
    });
  });

  it('should not notify subscribers when batch values are unchanged', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({
        a: '1',
        b: '2',
      });
    });

    const valueNotifications = nextSpy.mock.calls.filter(
      (call) =>
        call[0] != null &&
        typeof call[0] === 'object' &&
        'values' in (call[0] as Record<string, unknown>),
    );

    expect(valueNotifications).toHaveLength(0);
  });

  it('should notify subscribers only once for batch update', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({
        a: '100',
        b: '200',
      });
    });

    const valueNotifications = nextSpy.mock.calls.filter(
      (call) =>
        call[0] != null &&
        typeof call[0] === 'object' &&
        'values' in (call[0] as Record<string, unknown>),
    );

    expect(valueNotifications).toHaveLength(1);
  });

  it('should notify the batch update as a whole-form change (no stale name/type)', async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        defaultValues: { a: '1', b: '2' },
      }),
    );

    // Drive a single-field change first so `_formState.name`/`type` are
    // polluted with a stale field label from the prior emit.
    await act(async () => {
      result.current.register('a');
      result.current.setValue('a', 'changed', { shouldValidate: true });
    });

    const control = result.current.control as any;
    const nextSpy = jest.spyOn(control._subjects.state, 'next');

    await act(async () => {
      result.current.setValues({
        a: '10',
        b: '20',
      });
    });

    const valueNotifications = nextSpy.mock.calls.filter(
      (call) =>
        call[0] != null &&
        typeof call[0] === 'object' &&
        'values' in (call[0] as Record<string, unknown>),
    );

    // The terminal bulk emit must announce a whole-form change. Before the
    // fix it spread the stale `_formState.name`/`type` left over from the
    // prior single-field change, causing name-gated subscribers to skip it.
    const terminal = valueNotifications.at(-1)![0] as Record<string, unknown>;
    expect(terminal.name).toBeUndefined();
    expect(terminal.type).toBeUndefined();
    expect(terminal.values).toEqual({ a: '10', b: '20' });
  });

  it('should update controlled input value when setValues is called', async () => {
    const Component = () => {
      const { control, setValues } = useForm({
        defaultValues: {
          firstName: '',
        },
      });

      return (
        <>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => <input {...field} />}
          />
          <button
            type="button"
            onClick={() =>
              setValues({
                firstName: '111',
              })
            }
          >
            set
          </button>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'set' }));
    });

    expect(screen.getByRole('textbox')).toHaveValue('111');
  });

  it('should update registered input value when setValues is called', async () => {
    const Component = () => {
      const { register, setValues } = useForm({
        defaultValues: {
          firstName: '',
        },
      });

      return (
        <>
          <input {...register('firstName')} />
          <button
            type="button"
            onClick={() =>
              setValues({
                firstName: '111',
              })
            }
          >
            set
          </button>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'set' }));
    });

    expect(screen.getByRole('textbox')).toHaveValue('111');
  });

  it('should update deep nested registered input values when setValues is called', async () => {
    const Component = () => {
      const { register, setValues } = useForm({
        defaultValues: {
          user: {
            profile: { firstName: 'Jane', lastName: 'Doe' },
            address: { city: 'Boston' },
          },
        },
      });

      return (
        <>
          <input
            {...register('user.profile.firstName')}
            aria-label="firstName"
          />
          <input {...register('user.profile.lastName')} aria-label="lastName" />
          <input {...register('user.address.city')} aria-label="city" />
          <button
            type="button"
            onClick={() =>
              setValues({
                user: {
                  profile: { firstName: 'John', lastName: 'Smith' },
                  address: { city: 'New York' },
                },
              })
            }
          >
            set
          </button>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'set' }));
    });

    expect(screen.getByLabelText('firstName')).toHaveValue('John');
    expect(screen.getByLabelText('lastName')).toHaveValue('Smith');
    expect(screen.getByLabelText('city')).toHaveValue('New York');
  });

  it('should preserve object references for untouched values instead of deep cloning per field', async () => {
    type FormValues = {
      a: { nested: string };
      b: { nested: string };
    };

    const { result } = renderHook(() =>
      useForm<FormValues>({
        defaultValues: {
          a: { nested: '1' },
          b: { nested: '2' },
        },
      }),
    );

    const nextA = { nested: '10' };
    const nextB = { nested: '20' };

    await act(async () => {
      result.current.setValues({ a: nextA, b: nextB });
    });

    const values = result.current.getValues();

    expect(values).toEqual({ a: { nested: '10' }, b: { nested: '20' } });
    // setValues must not deep-clone each field via the internal setValue call,
    // so the exact objects passed in are kept by reference.
    expect(values.a).toBe(nextA);
    expect(values.b).toBe(nextB);
  });
});
