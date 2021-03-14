import { act, renderHook } from '@testing-library/react-hooks';
import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useForm } from '../../useForm';
import isFunction from '../../utils/isFunction';
import { VALIDATION_MODE } from '../../constants';
import isString from '../../utils/isString';

describe('register', () => {
  it('should support register passed to ref', async () => {
    const { result } = renderHook(() =>
      useForm<{ test: string }>({
        defaultValues: {
          test: 'testData',
        },
      }),
    );

    const { ref } = result.current.register('test');

    isFunction(ref) &&
      ref({
        target: {
          value: 'testData',
        },
      });

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: 'testData',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });
  });

  test.each([['text'], ['radio'], ['checkbox']])(
    'should register field for %s type and remain its value after unmount',
    async (type) => {
      const Component = () => {
        const {
          register,
          watch,
          formState: { isDirty },
        } = useForm<{
          test: string;
        }>({
          defaultValues: {
            test: 'test',
          },
        });

        const test = watch('test');

        return (
          <form>
            <input type={type} {...register('test')} />
            <span role="alert">{`${isDirty}`}</span>
            {test}
          </form>
        );
      };

      render(<Component />);

      const ref = screen.getByRole(type === 'text' ? 'textbox' : type);

      ref.remove();

      expect(screen.getByRole('alert').textContent).toBe('false');

      screen.getByText('test');
    },
  );

  test.each([['text'], ['radio'], ['checkbox']])(
    'should not register the same %s input',
    async (type) => {
      const callback = jest.fn();
      const Component = () => {
        const { register, handleSubmit } = useForm<{
          test: string;
        }>();
        return (
          <div>
            <input type={type} {...register('test')} />

            <button onClick={handleSubmit(callback)}>submit</button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /submit/ }));

      await waitFor(() =>
        expect(callback).toHaveBeenCalledWith(
          {
            test: type === 'checkbox' ? false : type === 'radio' ? null : '',
          },
          expect.any(Object),
        ),
      );
    },
  );

  it('should re-render if errors occurred with resolver when formState.isValid is defined', async () => {
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

    const Component = () => {
      const { register, formState } = useForm<{ test: string }>({
        resolver,
      });

      return (
        <div>
          <input {...register('test')} />
          <span role="alert">{`${formState.isValid}`}</span>
        </div>
      );
    };

    render(<Component />);

    expect(screen.getByRole('alert').textContent).toBe('false');
  });

  it('should be set default value when item is remounted again', async () => {
    const { result, unmount } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');

    result.current.setValue('test', 'test');

    unmount();

    const ref = { type: 'text', name: 'test' };

    result.current.register('test');

    expect(ref).toEqual({ type: 'text', name: 'test' });

    expect(result.current.getValues()).toEqual({ test: 'test' });
  });

  // issue: https://github.com/react-hook-form/react-hook-form/issues/2298
  it('should reset isValid formState after reset with valid value in initial render', async () => {
    const Component = () => {
      const { register, reset, formState } = useForm<{
        issue: string;
        test: string;
      }>({
        mode: VALIDATION_MODE.onChange,
      });

      React.useEffect(() => {
        setTimeout(() => {
          reset({ issue: 'test', test: 'test' });
        });
      }, [reset]);

      return (
        <div>
          <input {...register('test', { required: true })} />
          <input type="text" {...register('issue', { required: true })} />
          <button disabled={!formState.isValid}>submit</button>
        </div>
      );
    };

    await actComponent(async () => {
      render(<Component />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('should omit all inputs which has disabled set to true', async () => {
    let outputData: object = {};
    const watchedData: object[] = [];

    const Component = () => {
      const { register, handleSubmit, watch } = useForm<{
        test?: string;
        test1?: string;
        test2?: string;
        test3?: string;
        test4: string;
      }>();

      watchedData.push(watch());

      return (
        <form
          onSubmit={handleSubmit((data) => {
            outputData = data;
          })}
        >
          <input {...register('test')} disabled />
          <input
            disabled={true}
            value={'test'}
            type={'checkbox'}
            {...register('test1')}
          />
          <input
            disabled={true}
            value={'test'}
            type={'radio'}
            {...register('test2')}
          />
          <select {...register('test3')} disabled />
          <input {...register('test4')} data-testid={'input'} />
          <button>Submit</button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByTestId('input'), {
      target: { value: '1234' },
      test1: false,
      test2: undefined,
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(watchedData).toEqual([
      {},
      { test4: '1234', test1: false, test2: undefined },
    ]);

    expect(outputData).toEqual({
      test4: '1234',
      test1: false,
      test2: undefined,
    });
  });

  describe('register valueAs', () => {
    it('should return number value with valueAsNumber', async () => {
      let output = {};
      const Component = () => {
        const { register, handleSubmit } = useForm<{
          test: number;
          test1: boolean;
        }>();

        return (
          <form onSubmit={handleSubmit((data) => (output = data))}>
            <input {...register('test', { valueAsNumber: true })} />
            <input
              {...register('test1', {
                setValueAs: (value: string) => value === 'true',
              })}
            />
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.input(screen.getAllByRole('textbox')[0], {
        target: {
          value: '12345',
        },
      });

      fireEvent.input(screen.getAllByRole('textbox')[1], {
        target: {
          value: 'true',
        },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button'));
      });

      expect(output).toEqual({ test: 12345, test1: true });
    });

    it('should return NaN when value is valid', async () => {
      let output = {};
      const Component = () => {
        const { register, handleSubmit } = useForm<{
          test: number;
        }>();

        return (
          <form onSubmit={handleSubmit((data) => (output = data))}>
            <input {...register('test', { valueAsNumber: true })} />
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: '',
        },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button'));
      });

      expect(output).toEqual({ test: NaN });
    });

    it('should validate input before the valueAs', async () => {
      const Component = () => {
        const {
          register,
          formState: { errors },
        } = useForm<{
          test: number;
          test1: number;
        }>({
          mode: 'onChange',
        });

        return (
          <>
            <input
              {...register('test', {
                validate: (data) => {
                  return !isString(data);
                },
              })}
            />
            <span role="alert">{errors.test && 'Not number'}</span>

            <input
              {...register('test1', {
                valueAsNumber: true,
                min: 20,
              })}
            />
            <span role="alert">{errors.test && 'Number length'}</span>
          </>
        );
      };

      render(<Component />);

      await actComponent(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[0], {
          target: {
            value: '123',
          },
        });
      });

      screen.getByText('Not number');

      await actComponent(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[1], {
          target: {
            value: '12',
          },
        });
      });

      screen.getByText('Number length');
    });

    it('should send valueAs fields to schema validation', () => {
      let output: any;

      const Component = () => {
        const { register, trigger } = useForm<{
          test: number;
          test1: any;
          test2: boolean;
        }>({
          resolver: (data) => {
            output = data;
            return {
              values: {
                test: 1,
                test1: 2,
                test2: true,
              },
              errors: {},
            };
          },
        });

        return (
          <form>
            <input {...register('test', { valueAsNumber: true })} />
            <input {...register('test1', { valueAsDate: true })} />
            <input
              {...register('test2', { setValueAs: (data) => data === 'test' })}
            />
            <button type="button" onClick={() => trigger()}>
              trigger
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: 1 },
      });
      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: { value: '1990' },
      });
      fireEvent.change(screen.getAllByRole('textbox')[2], {
        target: { value: 'test' },
      });

      fireEvent.click(screen.getByRole('button'));

      expect(output).toEqual({
        test: 1,

        test1: new Date('1990'),
        test2: true,
      });
    });

    it('should send valueAs fields to in build validator', async () => {
      const Component = () => {
        const {
          register,
          trigger,
          formState: { errors },
        } = useForm({
          mode: 'onChange',
        });

        return (
          <>
            <input
              {...register('test', {
                validate: (value) => {
                  return value === 1;
                },
                valueAsNumber: true,
              })}
            />
            {errors.test && <p>test error</p>}
            <input
              {...register('test1', {
                validate: (value) => {
                  return value === 1;
                },
                setValueAs: (value) => parseInt(value),
              })}
            />
            {errors.test && <p>test1 error</p>}
            <button onClick={() => trigger()}>trigger</button>
          </>
        );
      };

      render(<Component />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('test error');
      screen.getByText('test1 error');

      await actComponent(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[0], {
          target: {
            value: '1',
          },
        });

        fireEvent.change(screen.getAllByRole('textbox')[1], {
          target: {
            value: '1',
          },
        });
      });

      expect(screen.queryByText('test error')).toBeNull();
      expect(screen.queryByText('test1 error')).toBeNull();
    });

    it('should send valueAs fields to resolver', async () => {
      const Component = () => {
        const {
          register,
          trigger,
          formState: { errors },
        } = useForm<{
          test: number;
          test1: number;
        }>({
          mode: 'onChange',
          resolver: async (data) => {
            const valid = !(isNaN(data.test) && isNaN(data.test1));

            return {
              errors: valid
                ? {}
                : {
                    test: {
                      type: 'error',
                      message: 'issue',
                    },
                    test1: {
                      type: 'error',
                      message: 'issue',
                    },
                  },
              values: valid
                ? {
                    test: 1,
                    test1: 2,
                  }
                : {},
            };
          },
        });

        return (
          <>
            <input
              {...register('test', {
                validate: (value) => {
                  return value === 1;
                },
                valueAsNumber: true,
              })}
            />
            {errors.test && <p>test error</p>}
            <input
              {...register('test1', {
                validate: (value) => {
                  return value === 1;
                },
                setValueAs: (value) => parseInt(value),
              })}
            />
            {errors.test && <p>test1 error</p>}
            <button onClick={() => trigger()}>trigger</button>
          </>
        );
      };

      render(<Component />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('test error');
      screen.getByText('test1 error');

      await actComponent(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[0], {
          target: {
            value: '1',
          },
        });

        fireEvent.change(screen.getAllByRole('textbox')[1], {
          target: {
            value: '1',
          },
        });
      });

      expect(screen.queryByText('test error')).toBeNull();
      expect(screen.queryByText('test1 error')).toBeNull();
    });
  });
});
