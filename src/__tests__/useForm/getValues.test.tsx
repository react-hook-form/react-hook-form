import { useForm } from '../../useForm';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import * as React from 'react';

describe('getValues', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should return defaultValues before inputs mounted', () => {
    let values;

    const Component = () => {
      const { getValues } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      values = getValues();

      return null;
    };

    const { rerender } = render(<Component />);

    expect(values).toEqual({
      test: 'test',
    });

    rerender(<Component />);

    expect(values).toEqual({});
  });

  it('should call getFieldsValues and return all values', () => {
    const { result } = renderHook(() => useForm<{ test: string }>());
    result.current.register('test');
    result.current.setValue('test', 'test');
    expect(result.current.getValues()).toEqual({ test: 'test' });
  });

  it('should get individual field value', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string }>({
        defaultValues: {
          test: '123',
        },
      }),
    );
    result.current.register('test');
    expect(result.current.getValues('test')).toEqual('123');
  });

  it('should get all field values', () => {
    const values = {
      test: 'test',
      test1: 'test1',
      test2: 'test2',
    };
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string; test2: string }>({
        defaultValues: values,
      }),
    );
    result.current.register('test');
    result.current.register('test1');
    result.current.register('test2');

    result.current.setValue('test', 'test');
    result.current.setValue('test1', 'test1');
    result.current.setValue('test2', 'test2');

    expect(result.current.getValues(['test', 'test1', 'test2'])).toEqual([
      'test',
      'test1',
      'test2',
    ]);
  });

  it('should get undefined when field not found', () => {
    const { result } = renderHook(() => useForm());

    expect(result.current.getValues('test')).toEqual(undefined);
  });

  it('should get value from shallowFieldsStateRef by name', () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    expect(result.current.getValues('test')).toEqual('test');
  });

  it('should get value from shallowFieldsStateRef by array', () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    expect(result.current.getValues(['test'])).toEqual(['test']);
  });

  it('should get value from shallowFieldsStateRef', () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    expect(result.current.getValues()).toEqual({
      test: 'test',
    });
  });

  it('should not get value from default value by name when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues('test')).toBeUndefined();
  });

  it('should not get value from default value by array when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues(['test'])).toEqual([undefined]);
  });

  it('should not get value from default value when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues()).toEqual({});
  });
});
