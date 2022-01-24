import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it.each(tests)('%s', (_, input, output) => {
    const { result } = renderHook(() => useForm<{ input: string }>());

    result.current.formState.errors;

    act(() => {
      result.current.setError('input', input);
    });
    expect(result.current.formState.errors).toEqual(output);
    expect(result.current.formState.isValid).toBeFalsy();
  });

  it('should update isValid with setError', async () => {
    const App = () => {
      const {
        formState: { isValid },
        setError,
      } = useForm({
        mode: 'onChange',
      });

      return (
        <div>
          <button
            type={'button'}
            onClick={() => {
              setError('test', { type: 'test' });
            }}
          >
            setError
          </button>
          {isValid ? 'yes' : 'no'}
        </div>
      );
    };

    render(<App />);

    await waitFor(() => {
      screen.getByText('yes');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('no');
    });
  });
});
