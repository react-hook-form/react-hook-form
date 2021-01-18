import { useForm } from '../../useForm';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { VALIDATION_MODE } from '../../constants';
import * as React from 'react';

describe('formState', () => {
  it('should return isValid correctly with resolver', async () => {
    let isValidValue = false;

    const Component = () => {
      const {
        register,
        formState: { isValid },
      } = useForm<{ test: string }>({
        mode: 'onChange',
        resolver: async (data) => {
          return {
            values: data.test ? data : {},
            errors: data.test
              ? {}
              : {
                  test: {
                    message: 'issue',
                    type: 'test',
                  },
                },
          };
        },
      });

      isValidValue = isValid;
      return <input {...register('test')} />;
    };

    await actComponent(async () => {
      render(<Component />);
    });

    expect(isValidValue).toBeFalsy();

    await actComponent(async () => {
      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });
    });

    await actComponent(async () => {
      expect(isValidValue).toBeTruthy();
    });
  });

  it('should return true for onBlur mode by default', () => {
    const { result } = renderHook(() =>
      useForm<{ input: string }>({
        mode: VALIDATION_MODE.onBlur,
      }),
    );

    expect(result.current.formState.isValid).toBeTruthy();
  });

  it('should return true for onChange mode by default', () => {
    const { result } = renderHook(() =>
      useForm<{ input: string }>({
        mode: VALIDATION_MODE.onChange,
      }),
    );

    expect(result.current.formState.isValid).toBeTruthy();
  });

  it('should return true when no validation is registered', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string }>({
        mode: VALIDATION_MODE.onBlur,
      }),
    );

    result.current.register('test');

    expect(result.current.formState.isValid).toBeTruthy();
  });

  it('should return false when default value is not valid value', async () => {
    const { result } = renderHook(() => {
      const methods = useForm<{ input: string; issue: string }>({
        mode: VALIDATION_MODE.onChange,
      });

      methods.formState.isValid;

      return methods;
    });

    await act(async () => {
      result.current.register('issue', { required: true });
      result.current.setValue('issue', '', { shouldValidate: true });
    });

    expect(result.current.formState.isValid).toBeFalsy();
  });

  it('should return true when default value meet the validation criteria', async () => {
    const { result } = renderHook(() =>
      useForm<{ input: string; issue: string }>({
        mode: VALIDATION_MODE.onChange,
      }),
    );

    result.current.formState.isValid;

    await act(async () => {
      result.current.register('issue', { required: true });
    });

    expect(result.current.formState.isValid).toBeTruthy();
  });

  it('should be a proxy object that returns undefined for unknown properties', () => {
    const { result } = renderHook(() => useForm());

    // @ts-expect-error
    expect(result.current.formState.nonExistentProperty).toBeUndefined();
  });

  it('should be a proxy object that properly implements the has trap', () => {
    const { result } = renderHook(() => useForm());

    expect('nonExistentProperty' in result.current.formState).toBeFalsy();
  });

  it('should be a proxy object that hasOwnProperty works on', () => {
    const { result } = renderHook(() => useForm());

    expect(result.current.formState).toHaveProperty('hasOwnProperty');
  });
});
