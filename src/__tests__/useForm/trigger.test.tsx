import { act, renderHook } from '@testing-library/react-hooks';
import { useForm } from '../../useForm';
import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { VALIDATION_MODE } from '../../constants';

describe('trigger', () => {
  it('should console warn when field is not found', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    process.env.NODE_ENV = 'development';

    const { result } = renderHook(() => useForm<{ test: string }>());
    expect(await result.current.trigger('test')).toBeFalsy();

    expect(console.warn).toBeCalledTimes(1);
  });

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
        expect(errors).toEqual({
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
});
