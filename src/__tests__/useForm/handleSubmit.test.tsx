import React from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { VALIDATION_MODE } from '../../constants';
import { Controller } from '../../controller';
import { createFormControl } from '../../logic/createFormControl';
import type { UseFormProps, UseFormReturn } from '../../types';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';
import isFunction from '../../utils/isFunction';
import noop from '../../utils/noop';

type TestFormValues = { test: string };

const useFormWithSubmitState = (props?: UseFormProps<TestFormValues>) => {
  const methods = useForm<TestFormValues>(props);
  const { isSubmitting, isSubmitted, isSubmitSuccessful, submitCount, errors } =
    methods.formState;

  return {
    methods,
    state: {
      isSubmitting,
      isSubmitted,
      isSubmitSuccessful,
      submitCount,
      errors,
    },
  };
};

const exceptionalSubmitState = {
  isSubmitting: false,
  isSubmitted: false,
  isSubmitSuccessful: false,
  submitCount: 0,
};

const captureError = async (callback: () => Promise<unknown>) => {
  let error: unknown;

  await act(async () => {
    try {
      await callback();
    } catch (caughtError) {
      error = caughtError;
    }
  });

  return error;
};

describe('handleSubmit', () => {
  afterEach(() => {
    jest.useRealTimers();
  });
  it('invoke the callback when validation pass', async () => {
    const { result } = renderHook(() => useForm());
    const callback = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });
    expect(callback).toHaveBeenCalled();
  });

  it('resolve with the typed return value of onValid', async () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { test: 'data' } }),
    );

    let returned: string | undefined;

    await act(async () => {
      returned = await result.current.handleSubmit(
        (data) => `hello ${data.test}`,
      )({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(returned).toBe('hello data');
  });

  it('resolve with the awaited return value when onValid is async', async () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { test: 'data' } }),
    );

    let returned: number | undefined;

    await act(async () => {
      returned = await result.current.handleSubmit(async (data) => {
        return data.test.length;
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(returned).toBe(4);
  });

  it('resolve with undefined when validation fails', async () => {
    const { result } = renderHook(() =>
      useForm({ defaultValues: { test: '' } }),
    );
    result.current.register('test', { required: true });
    const onValid = jest.fn(() => 'should not be returned');

    let returned: string | undefined;

    await act(async () => {
      returned = await result.current.handleSubmit(onValid)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(returned).toBeUndefined();
  });

  it('pass default value', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; deep: { nested: string; values: string } }>({
        mode: VALIDATION_MODE.onSubmit,
        defaultValues: {
          test: 'data',
          deep: {
            values: '5',
          },
        },
      }),
    );

    result.current.register('test');
    result.current.register('deep.nested');
    result.current.register('deep.values');

    await act(async () => {
      await result.current.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'data',
          deep: {
            nested: undefined,
            values: '5',
          },
        });
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });
  });

  it('not pass default value when field is not registered', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; deep: { nested: string; values: string } }>({
        mode: VALIDATION_MODE.onSubmit,
        defaultValues: {
          test: 'data',
          deep: {
            values: '5',
          },
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'data',
          deep: {
            values: '5',
          },
        });
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });
  });

  it('not provide reference to _formValues as data', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; deep: { values: string } }>({
        mode: VALIDATION_MODE.onSubmit,
        defaultValues: {
          test: 'data',
          deep: {
            values: '5',
          },
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit((data: any) => {
        data.deep.values = '12';
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    await act(async () => {
      await result.current.handleSubmit((data: any) => {
        expect(data.deep).toEqual({ values: '5' });
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });
  });

  it('not invoke callback when there are errors', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test', { required: true });

    const callback = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('not focus if errors is exist', async () => {
    const focus = jest.fn();
    const { result } = renderHook(() => useForm<{ test: string }>());
    const { ref } = result.current.register('test', { required: true });

    result.current.formState;

    isFunction(ref) &&
      ref({
        focus,
      });

    const callback = jest.fn();
    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(result.current.control._formState.errors?.test?.type).toBe(
      'required',
    );
  });

  it('not focus if shouldFocusError is false', async () => {
    const mockFocus = jest.spyOn(HTMLInputElement.prototype, 'focus');

    const { result } = renderHook(() =>
      useForm<{ test: string }>({ shouldFocusError: false }),
    );

    result.current.register('test', { required: true });
    result.current.formState;

    const callback = jest.fn();
    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(callback).not.toHaveBeenCalled();
    expect(mockFocus).not.toHaveBeenCalled();
    expect(result.current.control._formState.errors?.test?.type).toBe(
      'required',
    );
  });

  it('submit a checkbox group with array default values and native validation', async () => {
    const onSubmit = jest.fn();

    const App = () => {
      const { register, handleSubmit } = useForm<{ tags: string[] }>({
        shouldUseNativeValidation: true,
        defaultValues: { tags: ['a'] },
      });

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="checkbox" value="a" {...register('tags')} />
          <input type="checkbox" value="b" {...register('tags')} />
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('avoid re-focusing with native validation on submit', async () => {
    jest.useFakeTimers();

    const firstFocus = jest.fn();
    const lastFocus = jest.fn();

    const { result } = renderHook(() =>
      useForm<{ firstName: string; lastName: string }>({
        shouldUseNativeValidation: true,
        resolver: (_, __, options) => {
          for (const key of ['firstName', 'lastName'] as const) {
            const ref = options.fields[key].ref;
            ref.setCustomValidity?.('required');
            ref.reportValidity?.();
          }

          return {
            values: {},
            errors: {
              firstName: { type: 'required' },
              lastName: { type: 'required' },
            },
          };
        },
      }),
    );

    const first = result.current.register('firstName');
    const last = result.current.register('lastName');

    first.ref({
      name: 'firstName',
      focus: firstFocus,
      setCustomValidity: noop,
      reportValidity: noop,
    });
    last.ref({
      name: 'lastName',
      focus: lastFocus,
      setCustomValidity: noop,
      reportValidity: noop,
    });

    await act(async () => {
      await result.current.handleSubmit(noop)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(firstFocus).toHaveBeenCalledTimes(0);
    expect(lastFocus).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it('stop at the first invalid field with native validation', async () => {
    const { result } = renderHook(() =>
      useForm<{ firstName: string; lastName: string }>({
        shouldUseNativeValidation: true,
      }),
    );

    result.current.register('firstName', { required: true });
    result.current.register('lastName', { required: true });

    await act(async () => {
      await result.current.handleSubmit(noop)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(result.current.control._formState.errors.firstName?.type).toBe(
      'required',
    );
    expect(result.current.control._formState.errors.lastName).toBeUndefined();
  });

  it('stop at the first invalid field when native validation is set on useForm with a formControl', async () => {
    const { formControl } = createFormControl<{
      firstName: string;
      lastName: string;
    }>();

    const { result } = renderHook(() =>
      useForm<{ firstName: string; lastName: string }>({
        formControl,
        shouldUseNativeValidation: true,
      }),
    );

    result.current.register('firstName', { required: true });
    result.current.register('lastName', { required: true });

    await act(async () => {
      await result.current.handleSubmit(noop)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(result.current.control._formState.errors.firstName?.type).toBe(
      'required',
    );
    expect(result.current.control._formState.errors.lastName).toBeUndefined();
  });

  it('report every invalid field once native validation is turned off', async () => {
    const { result, rerender } = renderHook(
      ({ shouldUseNativeValidation }) =>
        useForm<{ firstName: string; lastName: string }>({
          shouldUseNativeValidation,
        }),
      { initialProps: { shouldUseNativeValidation: true } },
    );

    rerender({ shouldUseNativeValidation: false });

    result.current.register('firstName', { required: true });
    result.current.register('lastName', { required: true });

    await act(async () => {
      await result.current.handleSubmit(noop)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(result.current.control._formState.errors.firstName?.type).toBe(
      'required',
    );
    expect(result.current.control._formState.errors.lastName?.type).toBe(
      'required',
    );
  });

  it('submit form data when inputs are removed', async () => {
    const { result, unmount } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');
    result.current.setValue('test', 'test');

    unmount();

    await act(async () =>
      result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: 'test',
        });
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent),
    );
  });

  it('invoke onSubmit callback and reset nested errors when submit with valid form values', async () => {
    const callback = jest.fn();
    const { result } = renderHook(() =>
      useForm<{
        test: { firstName: string; lastName: string }[];
      }>(),
    );
    const validate = () => {
      return !!result.current
        .getValues()
        .test.some(({ firstName }) => firstName);
    };

    result.current.register('test.0.firstName', {
      validate,
    });
    result.current.register('test.0.lastName', {
      validate,
    });
    result.current.register('test.1.firstName', {
      validate,
    });
    result.current.register('test.1.lastName', {
      validate,
    });

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(callback).not.toHaveBeenCalled();

    result.current.setValue('test.0.firstName', 'test');

    await act(async () => {
      await result.current.handleSubmit(callback)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(callback).toHaveBeenCalled();
  });

  it('bubble the error up when an error occurs in the provided handleSubmit function by leaving formState flags in a consistent state', async () => {
    const errorMsg = 'this is an error';
    const App = () => {
      const [error, setError] = React.useState('');
      const {
        register,
        handleSubmit,
        formState: {
          isSubmitting,
          isSubmitted,
          isSubmitSuccessful,
          submitCount,
        },
      } = useForm();

      const rejectPromiseFn = jest.fn().mockRejectedValue(new Error(errorMsg));

      return (
        <form>
          <input {...register('test')} />
          <p>{error}</p>
          <p>isSubmitting : {isSubmitting ? 'true' : 'false'}</p>
          <p>isSubmitted : {isSubmitted ? 'true' : 'false'}</p>
          <p>isSubmitSuccessful : {isSubmitSuccessful ? 'true' : 'false'}</p>
          <p>submitCount : {submitCount}</p>
          <button
            type={'button'}
            onClick={() =>
              handleSubmit(rejectPromiseFn)().catch((err) =>
                setError(err.message),
              )
            }
          >
            Submit
          </button>
        </form>
      );
    };

    render(<App />);
    expect(await screen.findByText('isSubmitting : false')).toBeVisible();
    expect(await screen.findByText('isSubmitted : false')).toBeVisible();
    expect(await screen.findByText('isSubmitSuccessful : false')).toBeVisible();
    expect(await screen.findByText('submitCount : 0')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText(errorMsg)).toBeVisible();
    expect(await screen.findByText('isSubmitting : false')).toBeVisible();
    expect(await screen.findByText('isSubmitted : true')).toBeVisible();
    expect(await screen.findByText('isSubmitSuccessful : false')).toBeVisible();
    expect(await screen.findByText('submitCount : 1')).toBeVisible();
  });

  it.each(['throws', 'rejects'] as const)(
    'preserve the original error and only settle isSubmitting when onInvalid %s',
    async (failureType) => {
      const expectedError = new Error(`onInvalid ${failureType}`);
      const { result } = renderHook(() => useFormWithSubmitState());

      result.current.methods.register('test', { required: 'required' });
      const onInvalid =
        failureType === 'throws'
          ? () => {
              throw expectedError;
            }
          : async () => {
              throw expectedError;
            };

      const error = await captureError(() =>
        result.current.methods.handleSubmit(noop, onInvalid)(),
      );

      expect(error).toBe(expectedError);
      expect(result.current.state).toEqual({
        ...exceptionalSubmitState,
        errors: {
          test: expect.objectContaining({
            type: 'required',
            message: 'required',
          }),
        },
      });
    },
  );

  it.each(['throws', 'rejects'] as const)(
    'preserve the original error and only settle isSubmitting when the resolver %s',
    async (failureType) => {
      const expectedError = new Error(`resolver ${failureType}`);
      const resolver =
        failureType === 'throws'
          ? () => {
              throw expectedError;
            }
          : async () => {
              throw expectedError;
            };
      const { result } = renderHook(() => useFormWithSubmitState({ resolver }));

      result.current.methods.register('test');
      const error = await captureError(() =>
        result.current.methods.handleSubmit(noop)(),
      );

      expect(error).toBe(expectedError);
      expect(result.current.state).toEqual({
        ...exceptionalSubmitState,
        errors: {},
      });
    },
  );

  it.each(['throws', 'rejects'] as const)(
    'preserve the original error and only settle isSubmitting when a validator %s',
    async (failureType) => {
      const expectedError = new Error(`validator ${failureType}`);
      const { result } = renderHook(() => useFormWithSubmitState());
      const validate =
        failureType === 'throws'
          ? () => {
              throw expectedError;
            }
          : async () => {
              throw expectedError;
            };

      result.current.methods.register('test', { validate });
      const error = await captureError(() =>
        result.current.methods.handleSubmit(noop)(),
      );

      expect(error).toBe(expectedError);
      expect(result.current.state).toEqual({
        ...exceptionalSubmitState,
        errors: {},
      });
    },
  );

  it('preserve a falsy value thrown by onInvalid', async () => {
    const { result } = renderHook(() => useFormWithSubmitState());

    result.current.methods.register('test', { required: true });
    const error = await captureError(() =>
      result.current.methods.handleSubmit(noop, () => {
        throw 0;
      })(),
    );

    expect(error).toBe(0);
  });

  it('not publish submit cleanup after reset supersedes validation', async () => {
    const expectedError = new Error('resolver failed after reset');
    let rejectResolver!: (error: Error) => void;
    const { handleSubmit, reset, subscribe } =
      createFormControl<TestFormValues>({
        defaultValues: { test: 'before' },
        resolver: () =>
          new Promise((_, reject) => {
            rejectResolver = reject;
          }),
      });
    const onValid = jest.fn();
    const onInvalid = jest.fn();
    const subscriber = jest.fn();
    const unsubscribe = subscribe({
      formState: { isSubmitting: true },
      callback: subscriber,
    });

    const submitPromise = handleSubmit(onValid, onInvalid)();

    reset({ test: 'after' });
    expect(subscriber).toHaveBeenLastCalledWith(
      expect.objectContaining(exceptionalSubmitState),
    );
    subscriber.mockClear();

    rejectResolver(expectedError);
    await expect(submitPromise).rejects.toBe(expectedError);

    expect(subscriber).not.toHaveBeenCalled();
    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
    unsubscribe();
  });

  describe('with validationSchema', () => {
    it('invoke callback when error not found', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      result.current.register('test', { required: true });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: noop,
          persist: noop,
        } as React.SyntheticEvent);
      });
      expect(callback).toHaveBeenCalled();
    });

    it('invoke callback with transformed values', async () => {
      const resolver = async () => {
        return {
          values: { test: 'test' },
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      result.current.register('test', { required: true });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: noop,
          persist: noop,
        } as React.SyntheticEvent);
      });
      expect(callback.mock.calls[0][0]).toEqual({ test: 'test' });
    });
  });

  describe('with onInvalid callback', () => {
    it('invoke the onValid callback when validation pass', async () => {
      const { result } = renderHook(() => useForm());
      const onValidCallback = jest.fn();
      const onInvalidCallback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(
          onValidCallback,
          onInvalidCallback,
        )({
          preventDefault: noop,
          persist: noop,
        } as React.SyntheticEvent);
      });
      expect(onValidCallback).toHaveBeenCalledTimes(1);
      expect(onInvalidCallback).not.toHaveBeenCalledTimes(1);
    });

    it('invoke the onInvalid callback when validation failed', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );
      result.current.register('test', { required: true });
      const onValidCallback = jest.fn();
      const onInvalidCallback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(
          onValidCallback,
          onInvalidCallback,
        )({
          preventDefault: noop,
          persist: noop,
        } as React.SyntheticEvent);
      });

      expect(onValidCallback).not.toHaveBeenCalledTimes(1);
      expect(onInvalidCallback).toHaveBeenCalledTimes(1);
    });
  });

  it('not provide internal errors reference to onInvalid callback', async () => {
    const { result } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );
    result.current.register('test', { required: true });

    await act(async () => {
      await result.current.handleSubmit(noop, (errors) => {
        Object.freeze(errors);
      })({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    await act(async () => {
      expect(() =>
        result.current.setError('test', { message: 'Not enough', type: 'min' }),
      ).not.toThrow();
    });
  });

  it('be able to submit correctly when errors contains empty array object', async () => {
    const onSubmit = jest.fn();

    const App = () => {
      const { register, control, handleSubmit } = useForm({
        defaultValues: {
          test: [{ name: '1234' }],
        },
        mode: 'onChange',
      });
      const { fields, remove } = useFieldArray({ control, name: 'test' });

      return (
        <form
          onSubmit={handleSubmit(() => {
            onSubmit();
          })}
        >
          {fields.map((field, index) => {
            return (
              <input
                key={field.id}
                {...register(`test.${index}.name`, { required: true })}
              />
            );
          })}

          <button type={'button'} onClick={() => remove(0)}>
            remove
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('be able to submit correctly when errors contains empty array object and errors state is subscribed', async () => {
    const onSubmit = jest.fn();

    const App = () => {
      const {
        register,
        control,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: {
          test: [{ name: '1234' }],
        },
        mode: 'onChange',
      });
      const { fields, remove } = useFieldArray({ control, name: 'test' });

      return (
        <>
          <p>Number of errors: {Object.keys(errors).length}</p>
          <form
            onSubmit={handleSubmit(() => {
              onSubmit();
            })}
          >
            {fields.map((field, index) => {
              return (
                <input
                  key={field.id}
                  {...register(`test.${index}.name`, { required: true })}
                />
              );
            })}

            <button type={'button'} onClick={() => remove(0)}>
              remove
            </button>
            <button>submit</button>
          </form>
        </>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    });

    expect(await screen.findByText('Number of errors: 1')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });

  it('not invoke onValid when the resolver reports a root-level error', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string }>({
        resolver: async () => ({
          values: {},
          errors: {
            root: {
              type: 'cross-field',
              message: 'passwords do not match',
            },
          },
        }),
      }),
    );

    result.current.register('test');

    const onValid = jest.fn();
    const onInvalid = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(
        onValid,
        onInvalid,
      )({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(onInvalid.mock.calls[0][0]).toEqual({
      root: {
        type: 'cross-field',
        message: 'passwords do not match',
      },
    });
  });

  it('still clear a manually set root error on submit without a resolver', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');
    result.current.setValue('test', 'test');

    await act(async () => {
      result.current.setError('root.server', {
        type: 'server',
        message: 'stale server error',
      });
    });

    const onValid = jest.fn();

    await act(async () => {
      await result.current.handleSubmit(onValid)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    expect(onValid).toHaveBeenCalledTimes(1);
    expect(result.current.getFieldState('test').error).toBeUndefined();
  });

  it('ignore a stale resolver result when reset() runs mid-submit', async () => {
    let resolveResolver!: (v: { errors: any; values: any }) => void;
    const resolver = jest.fn(
      () =>
        new Promise<{ errors: any; values: any }>((resolve) => {
          resolveResolver = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useForm({ defaultValues: { test: 'before' }, resolver }),
    );

    const onValid = jest.fn();
    const onInvalid = jest.fn();

    let submitPromise: Promise<unknown>;
    await act(async () => {
      submitPromise = result.current.handleSubmit(
        onValid,
        onInvalid,
      )({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    await act(async () => {
      result.current.reset({ test: 'after' });
    });

    await act(async () => {
      resolveResolver({
        errors: { test: { type: 'validate', message: 'stale' } },
        values: { test: 'before' },
      });
      await submitPromise;
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.formState.submitCount).toBe(0);
    expect(result.current.formState.isSubmitted).toBe(false);
    expect(result.current.getValues()).toEqual({ test: 'after' });
  });

  it('not invoke onValid with stale values when reset() runs mid-submit', async () => {
    let resolveResolver!: (v: { errors: any; values: any }) => void;
    const resolver = jest.fn(
      () =>
        new Promise<{ errors: any; values: any }>((resolve) => {
          resolveResolver = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useForm({ defaultValues: { test: 'before' }, resolver }),
    );

    const onValid = jest.fn();

    let submitPromise: Promise<unknown>;
    act(() => {
      submitPromise = result.current.handleSubmit(onValid)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    act(() => {
      result.current.reset({ test: 'after' });
    });

    await act(async () => {
      resolveResolver({ errors: {}, values: { test: 'before' } });
      await submitPromise;
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(result.current.formState.submitCount).toBe(0);
    expect(result.current.formState.isSubmitSuccessful).toBe(false);
  });

  it('ignore a stale built-in validation result when reset() runs mid-submit', async () => {
    let resolveValidate!: (v: true | string) => void;
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { test: 'before' },
      }),
    );

    result.current.register('test', {
      validate: () =>
        new Promise<true | string>((resolve) => {
          resolveValidate = resolve;
        }),
    });

    const onValid = jest.fn();
    const onInvalid = jest.fn();

    let submitPromise: Promise<unknown>;
    await act(async () => {
      submitPromise = result.current.handleSubmit(
        onValid,
        onInvalid,
      )({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    await act(async () => {
      result.current.reset({ test: 'after' });
    });

    await act(async () => {
      resolveValidate('stale');
      await submitPromise;
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.formState.submitCount).toBe(0);
    expect(result.current.formState.isSubmitted).toBe(false);
    expect(result.current.getValues()).toEqual({ test: 'after' });
  });

  it('ignore a stale form-level validate result when reset() runs mid-submit', async () => {
    let resolveValidate!: (v: string | boolean) => void;
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { test: 'before' },
        validate: () =>
          new Promise<string | boolean>((resolve) => {
            resolveValidate = resolve;
          }),
      }),
    );

    const onValid = jest.fn();
    const onInvalid = jest.fn();

    let submitPromise: Promise<unknown>;
    await act(async () => {
      submitPromise = result.current.handleSubmit(
        onValid,
        onInvalid,
      )({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    await act(async () => {
      result.current.reset({ test: 'after' });
    });

    await act(async () => {
      resolveValidate('stale');
      await submitPromise;
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(onInvalid).not.toHaveBeenCalled();
    expect(result.current.formState.errors).toEqual({});
    expect(result.current.formState.submitCount).toBe(0);
    expect(result.current.formState.isSubmitted).toBe(false);
    expect(result.current.getValues()).toEqual({ test: 'after' });
  });

  it('not invoke onValid with stale values when reset() runs mid-submit', async () => {
    let resolveValidate!: (v: true | string) => void;
    const { result } = renderHook(() =>
      useForm({
        defaultValues: { test: 'before' },
      }),
    );

    result.current.register('test', {
      validate: () =>
        new Promise<true | string>((resolve) => {
          resolveValidate = resolve;
        }),
    });

    const onValid = jest.fn();

    let submitPromise: Promise<unknown>;
    act(() => {
      submitPromise = result.current.handleSubmit(onValid)({
        preventDefault: noop,
        persist: noop,
      } as React.SyntheticEvent);
    });

    act(() => {
      result.current.reset({ test: 'after' });
    });

    await act(async () => {
      resolveValidate(true);
      await submitPromise;
    });

    expect(onValid).not.toHaveBeenCalled();
    expect(result.current.formState.submitCount).toBe(0);
    expect(result.current.formState.isSubmitSuccessful).toBe(false);
  });

  describe('with disabled fields', () => {
    type FormValues = {
      items: { name: string; address?: { street: string } }[];
      address: { street: string };
      tags: string[];
      title: string;
    };

    type FieldsProps = UseFormReturn<FormValues>;

    const defaultValues: FormValues = {
      items: [{ name: 'a' }, { name: 'b' }],
      address: { street: 'x' },
      tags: ['c'],
      title: 't',
    };

    const submit = async (
      props: UseFormProps<FormValues>,
      Fields: React.ComponentType<FieldsProps>,
    ) => {
      const onValid = jest.fn();

      const App = () => {
        const form = useForm<FormValues>(props);

        return (
          <form onSubmit={form.handleSubmit(onValid)}>
            <Fields {...form} />
            <button>submit</button>
          </form>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onValid).toHaveBeenCalled());

      return onValid.mock.calls[0][0];
    };

    const TwoRowFields = ({ register }: FieldsProps) => (
      <>
        <input {...register('items.0.name', { disabled: true })} />
        <input {...register('items.1.name')} />
        <input {...register('address.street', { disabled: true })} />
        <input {...register('tags.0', { disabled: true })} />
        <input {...register('title')} />
      </>
    );

    it('should keep the row and the object that held a disabled field', async () => {
      expect(await submit({ defaultValues }, TwoRowFields)).toStrictEqual({
        items: [{}, { name: 'b' }],
        address: {},
        tags: new Array(1),
        title: 't',
      });
    });

    it('should keep the parents of disabled fields with a resolver', async () => {
      const resolver = async (values: FormValues) => ({ values, errors: {} });

      expect(
        await submit({ defaultValues, resolver }, TwoRowFields),
      ).toStrictEqual({
        items: [{}, { name: 'b' }],
        address: {},
        tags: new Array(1),
        title: 't',
      });
    });

    it('should keep a single row whose only field is disabled', async () => {
      expect(
        await submit(
          { defaultValues: { items: [{ name: 'a' }], title: 't' } },
          ({ register }) => (
            <input {...register('items.0.name', { disabled: true })} />
          ),
        ),
      ).toStrictEqual({ items: [{}], title: 't' });
    });

    it('should keep a row whose nested object only held a disabled field', async () => {
      expect(
        await submit(
          {
            defaultValues: { items: [{ name: 'a', address: { street: 'x' } }] },
          },
          ({ register }) => (
            <>
              <input {...register('items.0.name')} />
              <input
                {...register('items.0.address.street', { disabled: true })}
              />
            </>
          ),
        ),
      ).toStrictEqual({ items: [{ name: 'a', address: {} }] });
    });

    it('should keep the object of a disabled Controller', async () => {
      expect(
        await submit(
          { defaultValues: { address: { street: 'x' }, title: 't' } },
          ({ control }) => (
            <Controller
              control={control}
              name="address.street"
              disabled
              render={({ field }) => <input {...field} />}
            />
          ),
        ),
      ).toStrictEqual({ address: {}, title: 't' });
    });

    it('should keep the objects of fields disabled by the form', async () => {
      expect(
        await submit(
          {
            disabled: true,
            defaultValues: { address: { street: 'x' }, title: 't' },
          },
          ({ register }) => (
            <>
              <input {...register('address.street')} />
              <input {...register('title')} />
            </>
          ),
        ),
      ).toStrictEqual({ address: {} });
    });

    it('should submit the value of a field re-enabled before submit', async () => {
      const ReEnabled = ({ register }: FieldsProps) => {
        const [disabled, setDisabled] = React.useState(true);

        React.useEffect(() => setDisabled(false), []);

        return <input {...register('address.street', { disabled })} />;
      };

      expect(
        await submit(
          { defaultValues: { address: { street: 'x' } } },
          ReEnabled,
        ),
      ).toStrictEqual({ address: { street: 'x' } });
    });
  });
});
