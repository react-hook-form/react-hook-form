import { useForm } from '../../useForm';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import isFunction from '../../utils/isFunction';
import * as React from 'react';

describe('watch', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should return undefined when input gets unregister', async () => {
    const Component = () => {
      const { register, watch, unregister } = useForm<{ test: string }>();
      const data = watch('test');

      return (
        <>
          <input {...register('test')} />
          <span>{data}</span>
          <button type="button" onClick={() => unregister('test')}>
            hide
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    screen.getByText('test');

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button'));
    });

    expect(screen.queryByText('test')).toBeNull();
  });

  it('should watch individual input', async () => {
    const { result } = renderHook(() => {
      return useForm<{ test: string }>({
        defaultValues: {
          test: 'data',
        },
      });
    });

    expect(result.current.watch('test')).toBe(undefined);

    result.current.register('test');

    await act(async () => {
      result.current.setValue('test', 'data1');
    });

    act(() => {
      expect(result.current.watch('test')).toBe('data1');
    });
  });

  it('should return default value if field is undefined', () => {
    renderHook(() => {
      const { watch } = useForm<{ test: string }>({
        defaultValues: { test: 'test' },
      });

      expect(watch()).toEqual({ test: 'test' });
    });
  });

  it('should return default value if value is empty', () => {
    renderHook(() => {
      const { watch } = useForm<{ test: string }>();

      expect(watch('test', 'default')).toBe('default');
    });
  });

  it('should watch array of inputs', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string }>(),
    );

    expect(result.current.watch(['test', 'test1'])).toEqual([
      undefined,
      undefined,
    ]);

    const { ref } = result.current.register('test');
    isFunction(ref) &&
      ref({
        name: 'test',
        value: 'data1',
      });

    const { ref: ref1 } = result.current.register('test1');
    isFunction(ref1) &&
      ref1({
        name: 'test1',
        value: 'data2',
      });

    expect(result.current.watch(['test', 'test1'])).toEqual(['data1', 'data2']);
  });

  it('should watch every fields', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string }>(),
    );

    const { ref } = result.current.register('test');
    isFunction(ref) &&
      ref({
        name: 'test',
        value: 'data1',
      });

    const { ref: ref1 } = result.current.register('test1');
    isFunction(ref1) &&
      ref1({
        name: 'test1',
        value: 'data2',
      });

    expect(result.current.watch()).toEqual({ test: 'data1', test1: 'data2' });
  });
});
