import { act, renderHook } from '@testing-library/react';

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
});
