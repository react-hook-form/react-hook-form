import { act, renderHook } from '@testing-library/react-hooks';

import { DeepMap, ErrorOption, FieldError } from '../../types';
import { useForm } from '../../useForm';

describe('setError', () => {
  const tests: [string, ErrorOption, DeepMap<any, FieldError>][] = [
    [
      'should only set an error when it is not existed',
      { type: 'test' },
      {
        input: {
          type: 'test',
          message: undefined,
          ref: undefined,
        },
      },
    ],
    [
      'should set error message',
      { type: 'test', message: 'test' },
      {
        input: {
          type: 'test',
          message: 'test',
          ref: undefined,
          types: undefined,
        },
      },
    ],
    [
      'should set multiple error type',
      {
        types: { test1: 'test1', test2: 'test2' },
      },
      {
        input: {
          types: {
            test1: 'test1',
            test2: 'test2',
          },
          ref: undefined,
        },
      },
    ],
  ];
  test.each(tests)('%s', (_, input, output) => {
    const { result } = renderHook(() => useForm<{ input: string }>());
    act(() => {
      result.current.setError('input', input);
    });
    expect(result.current.formState.errors).toEqual(output);
    expect(result.current.formState.isValid).toBeFalsy();
  });
});
