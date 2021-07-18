import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { VALIDATION_MODE } from '../../constants';
import { useForm } from '../../useForm';

describe('trigger', () => {
  it('should remove all errors before set new errors when trigger entire form', async () => {
    const Component = () => {
      const [show, setShow] = React.useState(true);
      const {
        register,
        unregister,
        trigger,
        formState: { errors },
      } = useForm<{
        test: string;
      }>();

      return (
        <div>
          {show && <input {...register('test', { required: true })} />}
          <button type={'button'} onClick={() => trigger()}>
            trigger
          </button>
          <button
            type={'button'}
            onClick={() => {
              setShow(false);
              unregister('test');
            }}
          >
            toggle
          </button>
          {errors.test && <span>error</span>}
        </div>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    await waitFor(() => screen.getByText('error'));

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    });

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    expect(screen.queryByText('error')).toBeNull();
  });

  it('should return empty errors when field is found and validation pass', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());
    const { errors } = result.current.formState;

    result.current.register('test');

    await act(async () => {
      await result.current.trigger('test');
    });

    await act(async () => {
      await expect(errors).toEqual({});
    });
  });

  it('should update value when value is supplied', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    const { errors } = result.current.formState;

    result.current.register('test', { required: true });

    result.current.setValue('test', 'abc');

    await act(async () => {
      await result.current.trigger('test');
    });

    await actComponent(async () => {
      expect(errors).toEqual({});
    });
  });

  it('should trigger multiple fields validation', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string }>({
        mode: VALIDATION_MODE.onChange,
      }),
    );

    result.current.formState.errors;

    result.current.register('test', { required: 'required' });
    result.current.register('test1', { required: 'required' });

    await act(async () => {
      await result.current.trigger(['test', 'test1']);
    });

    expect(result.current.formState.errors?.test?.message).toBe('required');
    expect(result.current.formState.errors?.test1?.message).toBe('required');
  });

  describe('with schema', () => {
    it('should return the error with single field validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.formState.errors;

      result.current.register('test', { required: true });

      await act(async () => {
        await result.current.trigger('test');
      });
      expect(result.current.formState.errors).toEqual({
        test: { type: 'test' },
      });
    });

    it('should return the status of the requested field with single field validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test2: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.formState.errors;

      result.current.register('test1', { required: false });
      result.current.register('test2', { required: true });

      await act(async () =>
        expect(await result.current.trigger('test2')).toBeFalsy(),
      );

      expect(result.current.formState.errors).toEqual({
        test2: {
          type: 'test',
        },
      });
    });

    it('should not trigger any error when schema validation result not found', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver: async () => {
            return {
              values: {},
              errors: {
                test: {
                  type: 'test',
                },
              },
            };
          },
        }),
      );

      result.current.register('test', { required: true });

      await act(async () => {
        await result.current.trigger('test1');
      });

      expect(result.current.formState.errors).toEqual({});
    });

    it('should support array of fields for schema validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test1: {
              type: 'test1',
            },
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.formState.errors;

      result.current.register('test', { required: true });

      await act(async () => {
        await result.current.trigger(['test', 'test1']);
      });

      expect(result.current.formState.errors).toEqual({
        test1: {
          type: 'test1',
        },
        test: {
          type: 'test',
        },
      });
    });

    it('should return the status of the requested fields with array of fields for validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string; test3: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver: async () => {
            return {
              values: {},
              errors: {
                test3: {
                  type: 'test',
                },
              },
            };
          },
        }),
      );

      const { errors } = result.current.formState;

      result.current.register('test1', { required: false });
      result.current.register('test2', { required: false });
      result.current.register('test3', { required: true });

      await act(async () => {
        await result.current.trigger(['test1', 'test2']);
      });

      await act(async () => {
        expect(errors).toEqual({});
      });

      await act(async () => {
        await result.current.trigger(['test3']);
      });

      await act(async () => {
        expect(result.current.formState.errors).toEqual({
          test3: {
            type: 'test',
          },
        });
      });
    });

    it('should validate all fields when pass with undefined', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test1: {
              type: 'test1',
            },
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      result.current.formState.errors;

      result.current.register('test', { required: true });
      result.current.register('test1', { required: true });

      await act(async () => {
        await result.current.trigger();
      });

      expect(result.current.formState.errors).toEqual({
        test1: {
          type: 'test1',
        },
        test: {
          type: 'test',
        },
      });
    });
  });

  it('should return the status of the requested fields with array of fields for validation', async () => {
    const resolver = async (data: any) => {
      return {
        values: data,
        errors: { test3: 'test3' },
      };
    };

    const { result } = renderHook(() =>
      useForm<{ test1: string; test2: string; test3: string }>({
        mode: VALIDATION_MODE.onChange,
        resolver,
      }),
    );

    result.current.register('test1', { required: false });
    result.current.register('test2', { required: false });
    result.current.register('test3', { required: true });

    await act(async () =>
      expect(await result.current.trigger(['test1', 'test2'])).toBeTruthy(),
    );

    await act(async () =>
      expect(await result.current.trigger(['test3', 'test2'])).toBeFalsy(),
    );

    await act(async () =>
      expect(await result.current.trigger(['test3'])).toBeFalsy(),
    );

    await act(async () =>
      expect(await result.current.trigger(['test1'])).toBeTruthy(),
    );

    await act(async () => expect(await result.current.trigger()).toBeFalsy());
  });

  it('should return true when field is found and validation pass', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');

    expect(await result.current.trigger('test')).toBeTruthy();
  });

  it('should remove all errors before set new errors when trigger entire form', async () => {
    const Component = () => {
      const [show, setShow] = React.useState(true);
      const {
        register,
        trigger,
        formState: { errors },
      } = useForm<{
        test: string;
      }>({
        shouldUnregister: true,
      });

      return (
        <div>
          {show && <input {...register('test', { required: true })} />}
          <button type={'button'} onClick={() => trigger()}>
            trigger
          </button>
          <button type={'button'} onClick={() => setShow(false)}>
            toggle
          </button>
          {errors.test && <span>error</span>}
        </div>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    await waitFor(() => screen.getByText('error'));

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    });

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'trigger' }));
    });

    expect(screen.queryByText('error')).toBeNull();
  });

  it('should focus on errored input with build in validation', async () => {
    const Component = () => {
      const { register, trigger } = useForm<{
        test: string;
      }>();

      return (
        <>
          <input
            {...register('test', { required: true })}
            placeholder={'test'}
          />
          <button onClick={() => trigger('test', { shouldFocus: true })}>
            trigger
          </button>
        </>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(document.activeElement).toEqual(screen.getByPlaceholderText('test'));
  });

  it('should focus on errored input with schema validation', async () => {
    const Component = () => {
      const { register, trigger } = useForm<{
        test: string;
      }>({
        resolver: () => ({
          values: {},
          errors: {
            test: {
              type: 'test',
            },
          },
        }),
      });

      return (
        <>
          <input {...register('test')} placeholder={'test'} />
          <button onClick={() => trigger('test', { shouldFocus: true })}>
            trigger
          </button>
        </>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(document.activeElement).toEqual(screen.getByPlaceholderText('test'));
  });

  it('should focus on first errored input', async () => {
    const Component = () => {
      const { register, trigger } = useForm<{
        test: string;
        test2: string;
      }>();

      return (
        <>
          <input
            {...register('test', { required: true })}
            placeholder={'test'}
          />
          <input
            {...register('test2', { required: true })}
            placeholder={'test2'}
          />
          <button onClick={() => trigger(undefined, { shouldFocus: true })}>
            trigger
          </button>
        </>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(document.activeElement).toEqual(screen.getByPlaceholderText('test'));
  });

  it('should return isValid for the entire form', async () => {
    const App = () => {
      const [isValid, setIsValid] = React.useState(true);
      const { register, trigger, formState } = useForm();

      formState.isValid;

      return (
        <div>
          <input
            {...register('firstName', { required: true })}
            placeholder={'firstName'}
          />
          <input
            {...register('lastName', { required: true })}
            placeholder={'lastName'}
          />
          <button
            onClick={async () => {
              setIsValid(await trigger());
            }}
          >
            trigger
          </button>
          <p>{isValid ? 'true' : 'false'}</p>
        </div>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await waitFor(async () => {
      screen.getByText('false');
    });

    fireEvent.change(screen.getByPlaceholderText('firstName'), {
      target: {
        value: '1234',
      },
    });
    fireEvent.change(screen.getByPlaceholderText('lastName'), {
      target: {
        value: '1234',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(async () => {
      screen.getByText('true');
    });
  });

  it('should return correct valid state when trigger the entire form with build in validation', async () => {
    let isValid;

    function App() {
      const { register, trigger } = useForm();

      const onTrigger = async () => {
        isValid = await trigger();
      };

      return (
        <form>
          <input
            {...register('firstName', { required: true })}
            placeholder="First name"
          />
          <input
            {...register('last.name', { required: true })}
            placeholder="Last name"
          />

          <input type="button" onClick={onTrigger} value="trigger" />
        </form>
      );
    }

    render(<App />);

    actComponent(() => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(isValid).toBeFalsy();
  });
});
