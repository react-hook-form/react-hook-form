import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useForm } from '../../useForm';

describe('getValues', () => {
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

    expect(values).toEqual({
      test: 'test',
    });
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

  it('should get value from default value by name when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues('test')).toEqual('default');
  });

  it('should get value from default value by array when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues(['test'])).toEqual(['default']);
  });

  it('should not get value from default value when field is not registered', () => {
    const { result } = renderHook(() =>
      useForm({
        defaultValues: {
          test: 'default',
        },
      }),
    );

    expect(result.current.getValues()).toEqual({
      test: 'default',
    });
  });

  it('should return defaultValues when inputs are not registered', () => {
    let data: unknown;

    const Component = () => {
      const { getValues } = useForm({
        defaultValues: {
          test: 'test',
        },
      });

      if (!data) {
        data = getValues();
      }

      return null;
    };

    render(<Component />);

    expect(data).toEqual({ test: 'test' });
  });

  it('should return defaultValues deep merge with form values', async () => {
    let data: unknown;

    const Component = () => {
      const { getValues, register } = useForm({
        defaultValues: {
          test: {
            firstName: 'test',
            lastName: 'test',
            time: new Date('1999-09-09'),
            file: new File([''], 'filename'),
          },
        },
      });

      if (!data) {
        data = getValues();
      }

      return (
        <div>
          <input {...register('test.firstName')} />
          <button
            onClick={() => {
              data = getValues();
            }}
          >
            getValues
          </button>
        </div>
      );
    };

    render(<Component />);

    expect(data).toEqual({
      test: {
        firstName: 'test',
        lastName: 'test',
        time: new Date('1999-09-09'),
        file: new File([''], 'filename'),
      },
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1234',
      },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(data).toMatchObject({
      test: {
        firstName: '1234',
        lastName: 'test',
      },
    });
  });
});
