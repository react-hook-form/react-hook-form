import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  render,
  fireEvent,
  waitFor,
  act as actComponent,
  screen,
} from '@testing-library/react';
import { useForm } from './';
import { VALIDATION_MODE } from './constants';
import {
  NestedValue,
  UseFormMethods,
  ErrorOption,
  FieldError,
  RegisterOptions,
  DeepMap,
} from './types';
import { perf, wait, PerfTools } from 'react-performance-testing';
import 'jest-performance-testing';
import isFunction from './utils/isFunction';

let nodeEnv: string | undefined;

describe('useForm', () => {
  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    process.env.NODE_ENV = nodeEnv;
  });

  describe('register', () => {
    it('should return throw error when name is missing', () => {
      process.env.NODE_ENV = 'development';
      const { result } = renderHook(() => useForm<{ test: string }>());

      // @ts-expect-error
      const registerCallback = () => result.current.register();

      expect(registerCallback).toThrow(
        new Error(
          '📋 `name` prop is missing during register: https://react-hook-form.com/api#register',
        ),
      );
    });

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

    // test.each([['text'], ['radio'], ['checkbox']])(
    //   'should register field for %s type',
    //   async (type) => {
    //     const mockListener = jest.spyOn(
    //       findRemovedFieldAndRemoveListener,
    //       'default',
    //     );
    //     jest.spyOn(HTMLInputElement.prototype, 'addEventListener');
    //
    //     const Component = () => {
    //       const {
    //         register,
    //         formState: { isDirty },
    //       } = useForm<{
    //         test: string;
    //       }>();
    //       return (
    //         <div>
    //           <input type={type} {...register('test')} />
    //           <span role="alert">{`${isDirty}`}</span>
    //         </div>
    //       );
    //     };
    //
    //     const { renderCount } = perf<{ Component: unknown }>(React);
    //
    //     render(<Component />);
    //
    //     const ref = screen.getByRole(type === 'text' ? 'textbox' : type);
    //
    //     expect(ref.addEventListener).toHaveBeenCalledWith(
    //       type === 'radio' || type === 'checkbox'
    //         ? EVENTS.CHANGE
    //         : EVENTS.INPUT,
    //       expect.any(Function),
    //     );
    //
    //     // check MutationObserver
    //     ref.remove();
    //
    //     await waitFor(() => expect(mockListener).toHaveBeenCalled());
    //     expect(screen.getByRole('alert').textContent).toBe('false');
    //     await wait(() =>
    //       expect(renderCount.current.Component).toBeRenderedTimes(2),
    //     );
    //   },
    // );

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
              test: type === 'checkbox' ? false : '',
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

      const { renderCount } = perf<{ Component: unknown }>(React);

      render(<Component />);

      await wait(() => expect(renderCount.current.Component).toBeMounted());
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
  });

  describe('unregister', () => {
    it('should unregister an registered item', async () => {
      const { result } = renderHook(() => useForm<{ input: string }>());

      result.current.register('input');

      await act(async () => {
        await result.current.unregister('input');
      });

      expect(result.current.getValues()).toEqual({});
    });

    it('should unregister an registered item with array name', async () => {
      const { result } = renderHook(() =>
        useForm<{
          input: string;
          input2: string;
        }>(),
      );

      result.current.register('input');
      result.current.register('input');
      result.current.register('input2');

      await act(async () => {
        await result.current.unregister(['input', 'input2']);
      });

      expect(result.current.getValues()).toEqual({});
    });
  });

  describe('when component unMount', () => {
    it('should call unSubscribe', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');
      unmount();

      expect(result.current.getValues()).toEqual({});
    });

    it('should remain array field values when inputs gets unmounted', () => {
      const { result, unmount } = renderHook(() =>
        useForm<{ test: string[] }>(),
      );

      result.current.register('test.0');
      result.current.register('test.1');
      result.current.register('test.2');

      unmount();

      expect(result.current.getValues()).toEqual({
        test: [undefined, undefined, undefined],
      });
    });

    it('should not unregister errors when unmounted', async () => {
      const { result, unmount } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test', { required: true });

      await act(async () => {
        await result.current.handleSubmit(() => {})({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(result.current.formState.errors.test).toBeDefined();

      unmount();

      expect(result.current.formState.errors.test).toBeDefined();
    });

    it('should only unregister errors when unregister method invoked', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test', { required: true });

      await act(async () => {
        await result.current.handleSubmit(() => {})({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(result.current.formState.errors.test).toBeDefined();

      await act(async () => {
        result.current.unregister('test');
      });

      expect(result.current.formState.errors.test).not.toBeDefined();
    });

    it('should not unregister touched', () => {
      let formState: any;
      const Component = () => {
        const { register, formState: tempFormState } = useForm<{
          test: string;
        }>();
        formState = tempFormState;

        formState.touched;

        return (
          <div>
            <input {...register('test', { required: true })} />
          </div>
        );
      };
      const { unmount } = render(<Component />);

      fireEvent.blur(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });

      expect(formState.touched.test).toBeDefined();
      expect(formState.isDirty).toBeFalsy();

      unmount();

      expect(formState.touched.test).toBeDefined();
      expect(formState.isDirty).toBeFalsy();
    });

    it('should update dirty during unregister', () => {
      let formState: any;
      const Component = () => {
        const { register, formState: tempFormState } = useForm<{
          test: string;
        }>();
        formState = tempFormState;

        formState.isDirty;

        return <input {...register('test', { required: true })} />;
      };
      const { unmount } = render(<Component />);

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });

      expect(formState.dirty.test).toBeDefined();
      expect(formState.isDirty).toBeTruthy();

      unmount();

      expect(formState.dirty.test).toBeDefined();
      expect(formState.isDirty).toBeTruthy();
    });
  });

  describe('watch', () => {
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
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          defaultValues: {
            test: 'data',
          },
        }),
      );

      expect(result.current.watch('test')).toBe('data');

      result.current.register('test');

      await act(async () => {
        result.current.setValue('test', 'data1');
      });

      await expect(result.current.watch('test')).toBe('data1');
    });

    it('should return default value if field is undefined', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({ defaultValues: { test: 'test' } }),
      );

      expect(result.current.watch()).toEqual({ test: 'test' });
    });

    it('should return default value if value is empty', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      expect(result.current.watch('test', 'default')).toBe('default');
    });

    it('should watch array of inputs', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: undefined,
        test1: undefined,
      });

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

      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: 'data1',
        test1: 'data2',
      });
    });

    it('should watch every fields', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      const { ref } = result.current.register('test');
      // @ts-ignore
      ref({
        name: 'test',
        value: 'data1',
      });
      const { ref: ref1 } = result.current.register('test1');
      // @ts-ignore
      ref1({
        name: 'test1',
        value: 'data2',
      });

      expect(result.current.watch()).toEqual({ test: 'data1', test1: 'data2' });
    });
  });

  describe('reset', () => {
    it('should reset the form and re-render the form', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');
      result.current.setValue('test', 'data');

      expect(result.current.formState.isSubmitted).toBeFalsy();
      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: 'data',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(result.current.formState.isSubmitted).toBeTruthy();
      act(() => result.current.reset());
      expect(result.current.formState.isSubmitted).toBeFalsy();
    });

    it('should reset form value', () => {
      let methods: any;
      const Component = () => {
        methods = useForm<{
          test: string;
        }>();
        return (
          <form>
            <input {...methods.register('test')} />
          </form>
        );
      };
      render(<Component />);

      actComponent(() =>
        methods.reset({
          test: 'test',
        }),
      );

      expect(methods.getValues()).toEqual({
        test: 'test',
      });
    });

    it('should reset the form if ref is HTMLElement and parent element is form', async () => {
      const mockReset = jest.spyOn(window.HTMLFormElement.prototype, 'reset');
      let methods: UseFormMethods<{ test: string }>;
      const Component = () => {
        methods = useForm<{ test: string }>();
        return (
          <form>
            <input {...methods.register('test')} />
          </form>
        );
      };
      render(<Component />);

      actComponent(() => methods.reset());

      expect(mockReset).toHaveBeenCalled();
    });

    it('should reset the form if ref is HTMLElement and parent element is not form', async () => {
      const mockReset = jest.spyOn(window.HTMLFormElement.prototype, 'reset');
      let methods: UseFormMethods<{
        test: string;
      }>;
      const Component = () => {
        methods = useForm<{
          test: string;
        }>();
        return <input {...methods.register('test')} />;
      };
      render(<Component />);

      actComponent(() => methods.reset());

      expect(mockReset).not.toHaveBeenCalled();
    });

    it('should set default value if values is specified to first argument', async () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test');

      act(() => result.current.reset({ test: 'test' }));

      expect(result.current.control.defaultValuesRef.current).toEqual({
        test: 'test',
      });
    });

    it('should reset unmountFieldsState value when shouldUnregister set to false', () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test');

      act(() => result.current.reset({ test: 'test' }));
    });

    it('should not reset unmountFieldsState value by default', () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test');

      act(() => result.current.reset({ test: 'test' }));
    });

    it('should not reset if OmitResetState is specified', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');

      // check only public variables
      result.current.formState.errors = {
        test: {
          type: 'test',
          message: 'something wrong',
        },
      };
      result.current.control.validFieldsRef.current = {
        test: true,
      };
      result.current.control.fieldsWithValidationRef.current = {
        test: true,
      };

      result.current.formState.touched = { test: true };
      result.current.formState.isDirty = true;
      result.current.formState.isSubmitted = true;

      act(() =>
        result.current.reset(
          { test: '' },
          {
            errors: true,
            isDirty: true,
            isSubmitted: true,
            touched: true,
            isValid: true,
            submitCount: true,
            dirty: true,
          },
        ),
      );

      expect(result.current.formState.errors).toEqual({
        test: {
          type: 'test',
          message: 'something wrong',
        },
      });
      expect(result.current.formState.touched).toEqual({
        test: true,
      });
      expect(result.current.control.validFieldsRef.current).toEqual({
        test: true,
      });
      expect(result.current.control.fieldsWithValidationRef.current).toEqual({
        test: true,
      });
      expect(result.current.formState.isDirty).toBeTruthy();
      expect(result.current.formState.isSubmitted).toBeTruthy();
    });
  });

  describe('setValue', () => {
    it('should not setValue for unmounted state with shouldUnregister', () => {
      const { result } = renderHook(() => useForm<{ test1: string }>());

      result.current.register('test1');
      result.current.setValue('test1', 'data');
    });

    it('should empty string when value is null or undefined when registered field is HTMLElement', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          defaultValues: {
            test: 'test',
          },
        }),
      );

      const elm = document.createElement('input');
      elm.type = 'text';
      elm.name = 'test';

      result.current.register('test');

      result.current.setValue('test', null);

      expect(elm).not.toHaveValue();

      result.current.setValue('test', undefined);

      expect(elm).not.toHaveValue();
    });

    it('should set value of radio input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');

      result.current.setValue('test', '1');

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '1',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set value of file input correctly if value is FileList', async () => {
      const { result } = renderHook(() => useForm<{ test: FileList }>());

      result.current.register('test');

      const blob = new Blob([''], { type: 'image/png' }) as any;
      blob['lastModifiedDate'] = '';
      blob['name'] = 'filename';
      const file = blob as File;
      // @ts-ignore
      const fileList: FileList = {
        0: file,
        1: file,
        length: 2,
        item: () => file,
      };

      act(() => result.current.setValue('test', fileList));

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: fileList,
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set value of multiple checkbox input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      const { ref } = result.current.register('test');

      const elm = document.createElement('input');
      elm.type = 'checkbox';
      elm.name = 'test';
      elm.value = '2';

      document.body.append(elm);
      // @ts-ignore
      ref(elm);

      const { ref: ref1 } = result.current.register('test');

      const elm1 = document.createElement('input');
      elm1.type = 'checkbox';
      elm1.name = 'test';
      elm1.value = '1';

      document.body.append(elm1);
      // @ts-ignore
      ref1(elm1);

      result.current.setValue('test', ['1']);

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: ['1'],
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set array value of multiple checkbox inputs correctly', async () => {
      const Component = () => {
        const { register } = useForm<{
          test: NestedValue<string[]>;
        }>({
          defaultValues: {
            test: ['1', '2'],
          },
        });

        return (
          <>
            <input type="checkbox" value={'1'} {...register('test')} />
            <input type="checkbox" value={'2'} {...register('test')} />
          </>
        );
      };

      render(<Component />);

      screen
        .getAllByRole('checkbox')
        .forEach((checkbox) =>
          expect((checkbox as HTMLInputElement).checked).toBeTruthy(),
        );
    });

    it('should set value of single checkbox input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');

      result.current.setValue('test', '1');

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '1',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set value of multiple select correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');

      result.current.setValue('test', '1');

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: ['1'],
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set object array value', () => {
      const { result } = renderHook(() =>
        useForm<{
          test: {
            one: string;
            two: string;
            three: string;
          }[];
        }>(),
      );

      result.current.register('test.0.one');
      result.current.register('test.0.two');
      result.current.register('test.0.three');

      act(() => {
        result.current.setValue('test', {
          one: 'ONE',
          two: 'TWO',
          three: 'THREE',
        });
      });

      expect(result.current.getValues()).toEqual({
        test: [
          {
            one: 'ONE',
            two: 'TWO',
            three: 'THREE',
          },
        ],
      });
    });

    it('should set unmountFieldsState value when shouldUnregister is set to false', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; checkbox: string[] }>(),
      );

      act(() => {
        result.current.setValue('test', '1');
        result.current.setValue('checkbox', ['1', '2']);
        result.current.setValue('test1[0]', {
          one: 'ONE',
          two: 'TWO',
          three: 'THREE',
        });
      });
    });

    it('should set nested value correctly ', () => {
      const { result } = renderHook(() =>
        useForm<{
          test1: NestedValue<string[]>;
          test2: NestedValue<{
            key1: string;
            key2: number;
          }>;
          test3: NestedValue<
            {
              key1: string;
              key2: number;
            }[]
          >;
        }>(),
      );

      result.current.register('test1');
      result.current.register('test2');
      result.current.register('test3');

      act(() => {
        result.current.setValue('test1', ['1', '2', '3']);
        result.current.setValue('test2', { key1: '1', key2: 2 });
        result.current.setValue('test3', [
          { key1: '1', key2: 2 },
          { key1: '3', key2: 4 },
        ]);
      });

      expect(result.current.control.fieldsRef.current['test1']).toEqual({
        ref: { name: 'test1', value: ['1', '2', '3'] },
      });
      expect(result.current.control.fieldsRef.current['test2']).toEqual({
        ref: { name: 'test2', value: { key1: '1', key2: 2 } },
      });
      expect(result.current.control.fieldsRef.current['test3']).toEqual({
        ref: {
          name: 'test3',
          value: [
            { key1: '1', key2: 2 },
            { key1: '3', key2: 4 },
          ],
        },
      });
    });

    it('should work with array fields', () => {
      const { result } = renderHook(() =>
        useForm<{
          test: string[];
          test1: {
            test: string;
          }[];
        }>(),
      );

      result.current.register('test1.0.test');
      result.current.register('test.0');
      result.current.register('test.1');
      result.current.register('test.2');

      act(() => result.current.setValue('test', ['1', '2', '3']));

      expect(result.current.control.fieldsRef.current['test,0']).toEqual({
        ref: { name: 'test,0', value: '1' },
      });
      expect(result.current.control.fieldsRef.current['test[1]']).toEqual({
        ref: { name: 'test[1]', value: '2' },
      });
      expect(result.current.control.fieldsRef.current['test[2]']).toEqual({
        ref: { name: 'test[2]', value: '3' },
      });
    });

    it('should worked with nested array fields with object', () => {
      const { result } = renderHook(() =>
        useForm<{
          test: {
            test: string;
          }[];
        }>(),
      );

      result.current.register('test.0.test');
      result.current.register('test.1.test');
      result.current.register('test.2.test');

      act(() =>
        result.current.setValue('test', [
          { test: '1' },
          { test: '2' },
          { test: '3' },
        ]),
      );

      expect(result.current.control.fieldsRef.current['test[0].test']).toEqual({
        ref: { name: 'test.0..test', value: '1' },
      });
      expect(result.current.control.fieldsRef.current['test[1].test']).toEqual({
        ref: { name: 'test.1.test', value: '2' },
      });
      expect(result.current.control.fieldsRef.current['test[2].test']).toEqual({
        ref: { name: 'test.2.test', value: '3' },
      });
    });

    it('should work with object fields', () => {
      const { result } = renderHook(() =>
        useForm<{
          test1: {
            test: string;
          }[];
          test: {
            bill: string;
            luo: string;
            test: string;
          };
        }>(),
      );

      result.current.register('test1.0.test');
      result.current.register('test.bill');
      result.current.register('test.luo');
      result.current.register('test.test');

      act(() =>
        result.current.setValue('test', { bill: '1', luo: '2', test: '3' }),
      );
      expect(result.current.control.fieldsRef.current['test.bill']).toEqual({
        ref: { name: 'test.bill', value: '1' },
      });
      expect(result.current.control.fieldsRef.current['test.luo']).toEqual({
        ref: { name: 'test.luo', value: '2' },
      });
      expect(result.current.control.fieldsRef.current['test.test']).toEqual({
        ref: { name: 'test.test', value: '3' },
      });
    });

    it('should not work if field is not registered', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.setValue('test', '1');
      });

      expect(result.current.control.fieldsRef.current['test']).toBeUndefined();
    });

    describe('with watch', () => {
      it('should get watched value', () => {
        const { result } = renderHook(() => {
          const { register, watch, setValue } = useForm<{ test: string }>();

          register('test');

          React.useEffect(() => {
            setValue('test', 'abc');
          }, [setValue]);

          return watch('test');
        });

        expect(result.current).toBe('abc');
      });
    });

    describe('with validation', () => {
      it('should be called trigger method if shouldValidate variable is true', async () => {
        const { result } = renderHook(() =>
          useForm<{
            test: string;
          }>(),
        );

        result.current.register('test', {
          minLength: {
            value: 5,
            message: 'min',
          },
        });

        result.current.formState.dirty;

        await act(async () =>
          result.current.setValue('test', 'abc', {
            shouldValidate: true,
          }),
        );

        expect(result.current.formState.errors?.test?.message).toBe('min');
      });

      it('should not be called trigger method if config is empty', async () => {
        const { result } = renderHook(() => useForm<{ test: string }>());

        result.current.register('test', {
          minLength: {
            value: 5,
            message: 'min',
          },
        });

        result.current.setValue('test', 'abc');

        expect(result.current.formState.errors?.test).toBeUndefined();
      });

      it('should be called trigger method if shouldValidate variable is true and field value is array', async () => {
        const { result } = renderHook(() =>
          useForm<{
            test: string[];
          }>(),
        );

        const rules = {
          minLength: {
            value: 5,
            message: 'min',
          },
        };

        result.current.register('test.0', rules);
        result.current.register('test.1', rules);
        result.current.register('test.2', rules);

        await act(async () =>
          result.current.setValue('test', ['abc1', 'abc2', 'abc3'], {
            shouldValidate: true,
          }),
        );

        expect(result.current.formState.errors?.test?.[0]?.message).toBe('min');
        expect(result.current.formState.errors?.test?.[1]?.message).toBe('min');
        expect(result.current.formState.errors?.test?.[2]?.message).toBe('min');
      });

      it('should not be called trigger method if config is empty and field value is array', async () => {
        const { result } = renderHook(() =>
          useForm<{
            test: string[];
          }>(),
        );

        const rules = {
          minLength: {
            value: 5,
            message: 'min',
          },
        };

        result.current.register('test.0', rules);
        result.current.register('test.1', rules);
        result.current.register('test.2', rules);

        act(() => result.current.setValue('test', ['test', 'test1', 'test2']));

        expect(result.current.formState.errors?.test).toBeUndefined();
      });
    });

    describe('with dirty', () => {
      it.each(['isDirty', 'dirtyFields'])(
        'should be dirty when %s is defined when shouldDirty is true',
        (property) => {
          const { result } = renderHook(() => useForm<{ test: string }>());

          (result.current.formState as any)[property];
          result.current.formState.isDirty;

          result.current.register('test');

          act(() =>
            result.current.setValue('test', 'test', { shouldDirty: true }),
          );

          expect(result.current.formState.isDirty).toBeTruthy();
          expect(result.current.formState.dirty).toEqual({ test: true });
        },
      );

      it.each([
        ['isDirty', ['test1', 'test2', 'test3'], [true, true, true]],
        ['dirtyFields', ['test1', 'test2', 'test3'], [true, true, true]],
        ['isDirty', ['test1', '', 'test3'], [true, undefined, true]],
        ['dirtyFields', ['test1', '', 'test3'], [true, undefined, true]],
      ])(
        'should be dirty when %s is defined when shouldDirty is true with array fields',
        (property, values, dirtyFields) => {
          const { result } = renderHook(() =>
            useForm<{
              test: string[];
            }>({
              defaultValues: {
                test: ['', '', ''],
              },
            }),
          );

          (result.current.formState as any)[property];
          result.current.formState.isDirty;

          result.current.register('test.0');
          result.current.register('test.1');
          result.current.register('test.2');

          act(() =>
            result.current.setValue('test', values, {
              shouldDirty: true,
            }),
          );

          expect(result.current.formState.isDirty).toBeTruthy();
          expect(result.current.formState.dirty).toEqual({
            test: dirtyFields,
          });
        },
      );

      it.each(['isDirty', 'dirtyFields'])(
        'should not be dirty when %s is defined when shouldDirty is false',
        (property) => {
          const { result } = renderHook(() =>
            useForm<{
              test: string;
            }>(),
          );

          (result.current.formState as any)[property];

          result.current.register('test');

          act(() =>
            result.current.setValue('test', 'test', { shouldDirty: false }),
          );

          expect(result.current.formState.isDirty).toBeFalsy();
          expect(result.current.formState.dirty).toEqual({});
        },
      );

      it.each(['isDirty', 'dirtyFields'])(
        'should set name to dirtyFieldRef if field value is different with default value when formState.dirty is defined',
        (property) => {
          const { result } = renderHook(() =>
            useForm<{ test: string }>({
              defaultValues: { test: 'default' },
            }),
          );
          (result.current.formState as any)[property];
          result.current.formState.isDirty;

          result.current.register('test');

          act(() =>
            result.current.setValue('test', '1', { shouldDirty: true }),
          );

          expect(result.current.formState.isDirty).toBeTruthy();
          expect(result.current.formState.dirty.test).toBeTruthy();
        },
      );

      it.each(['isDirty', 'dirtyFields'])(
        'should unset name from dirtyFieldRef if field value is not different with default value when formState.dirty is defined',
        (property) => {
          const { result } = renderHook(() =>
            useForm<{ test: string }>({
              defaultValues: { test: 'default' },
            }),
          );
          (result.current.formState as any)[property];
          result.current.formState.isDirty;

          result.current.register('test');

          act(() =>
            result.current.setValue('test', '1', { shouldDirty: true }),
          );

          expect(result.current.formState.isDirty).toBeTruthy();
          expect(result.current.formState.dirty.test).toBeTruthy();

          act(() =>
            result.current.setValue('test', 'default', { shouldDirty: true }),
          );

          expect(result.current.formState.isDirty).toBeFalsy();
          expect(result.current.formState.dirty.test).toBeUndefined();
        },
      );
    });

    it('should set hidden input value correctly and reflect on the submission data', async () => {
      let submitData = undefined;

      const Component = () => {
        const { register, handleSubmit, setValue } = useForm<{
          test: string;
        }>();

        return (
          <div>
            <input type="hidden" defaultValue="test" {...register('test')} />
            <button
              onClick={() => {
                setValue('test', 'changed');
              }}
            >
              change
            </button>
            <button
              onClick={handleSubmit((data) => {
                submitData = data;
              })}
            >
              submit
            </button>
          </div>
        );
      };

      render(<Component />);

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button', { name: 'change' }));
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      expect(submitData).toEqual({
        test: 'changed',
      });
    });

    it('should validate the input and return correct isValid formState', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: { data: string; data1: string } }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      result.current.formState.isValid;

      await act(async () => {
        await result.current.register('test.data', { required: true });
        await result.current.register('test.data1', { required: true });
      });

      await act(async () => {
        await result.current.trigger();
      });

      await act(async () => {
        result.current.setValue('test.data', 'test', { shouldValidate: true });
      });

      expect(result.current.formState.isValid).toBeFalsy();

      await act(async () => {
        await result.current.setValue('test.data1', 'test', {
          shouldValidate: true,
        });
      });

      expect(result.current.formState.isValid).toBeTruthy();
    });
  });

  describe('trigger', () => {
    it('should console warn when field is not found', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() => useForm<{ test: string }>());
      expect(await result.current.trigger('test')).toBeFalsy();

      expect(console.warn).toBeCalledTimes(1);

      // @ts-ignore
      console.warn.mockRestore();
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
        }>();

        return (
          <div>
            {show && <input {...register('test')} />}
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

    it('should return true when field is found and validation pass', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test');

      expect(await result.current.trigger('test')).toBeTruthy();
    });

    it('should update value when value is supplied', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test', { required: true });

      result.current.setValue('test', 'abc');

      await act(async () =>
        expect(await result.current.trigger('test')).toBeTruthy(),
      );
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
        await result.current.trigger(['test', 'test1'] as any);
      });

      expect(result.current.formState.errors?.test?.message).toBe('required');
      expect(result.current.formState.errors?.test1?.message).toBe('required');
    });
  });

  describe('trigger with schema', () => {
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
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test3: {
              type: 'test',
            },
          },
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

  describe('handleSubmit', () => {
    it('should invoke the callback when validation pass', async () => {
      const { result } = renderHook(() => useForm());
      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should pass default value', async () => {
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
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should not pass default value when field is not registered', async () => {
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
          expect(data).toEqual({});
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should invoke reRender method when readFormStateRef.current.isSubmitting is true', async () => {
      const Component = () => {
        const { register, handleSubmit, formState } = useForm<{
          test: string;
        }>();
        return (
          <div>
            <input {...register('test')} />
            <button onClick={handleSubmit(() => {})}></button>
            <span role="alert">
              {formState.isSubmitting ? 'true' : 'false'}
            </span>
          </div>
        );
      };

      const { renderCount } = perf<{ Component: unknown }>(React);

      render(<Component />);

      fireEvent.click(screen.getByRole('button'));

      const span = screen.getByRole('alert')!;
      await waitFor(
        () => {
          if (renderCount.current.Component?.value === 2) {
            expect(span.textContent).toBe('true');
          } else {
            expect(span.textContent).toBe('false');
          }
        },
        { container: span },
      );

      await wait(() => {
        expect(renderCount.current.Component).toBeRenderedTimes(4);
      });
    });

    it('should not invoke callback when there are errors', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test', { required: true });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).not.toBeCalled();
    });

    it('should not focus if errors is exist', async () => {
      const mockFocus = jest.spyOn(HTMLInputElement.prototype, 'focus');

      const { result } = renderHook(() => useForm<{ test: string }>());

      result.current.register('test', { required: true });

      const callback = jest.fn();
      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(callback).not.toBeCalled();
      expect(mockFocus).toBeCalled();
      expect(result.current.formState.errors?.test?.type).toBe('required');
    });

    it('should not focus if shouldFocusError is false', async () => {
      const mockFocus = jest.spyOn(HTMLInputElement.prototype, 'focus');

      const { result } = renderHook(() =>
        useForm<{ test: string }>({ shouldFocusError: false }),
      );

      result.current.register('test', { required: true });

      const callback = jest.fn();
      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(callback).not.toBeCalled();
      expect(mockFocus).not.toBeCalled();
      expect(result.current.formState.errors?.test?.type).toBe('required');
    });

    it('should submit data from shallowFieldsStateRef when shouldUnRegister is false', async () => {
      const { result, unmount } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test');

      unmount();

      await act(async () =>
        result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: 'test',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent),
      );
    });

    it('should invoke onSubmit callback and reset nested errors when submit with valid form values', async () => {
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
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(callback).not.toBeCalled();

      result.current.setValue('test[0].firstName', 'test');

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(callback).toBeCalled();
    });
  });

  describe('handleSubmit with validationSchema', () => {
    it('should invoke callback when error not found', async () => {
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
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should invoke callback with transformed values', async () => {
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
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback.mock.calls[0][0]).toEqual({ test: 'test' });
    });
  });

  describe('handleSubmit with onInvalid callback', () => {
    it('should invoke the onValid callback when validation pass', async () => {
      const { result } = renderHook(() => useForm());
      const onValidCallback = jest.fn();
      const onInvalidCallback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(
          onValidCallback,
          onInvalidCallback,
        )({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(onValidCallback).toBeCalledTimes(1);
      expect(onInvalidCallback).not.toBeCalledTimes(1);
    });

    it('should invoke the onInvalid callback when validation failed', async () => {
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
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(onValidCallback).not.toBeCalledTimes(1);
      expect(onInvalidCallback).toBeCalledTimes(1);
    });
  });

  describe('getValues', () => {
    it('should call getFieldsValues and return all values', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      result.current.register('test');
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
      expect(result.current.getValues(['test', 'test1', 'test2'])).toEqual(
        values,
      );
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

      unmount();

      expect(result.current.getValues(['test'])).toEqual({ test: 'test' });
    });

    it('should get value from shallowFieldsStateRef', () => {
      const { result, unmount } = renderHook(() =>
        useForm<{
          test: string;
        }>(),
      );

      result.current.register('test');

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

      expect(result.current.getValues(['test'])).toEqual({ test: undefined });
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

  describe('clearErrors', () => {
    it('should remove error', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      act(() => {
        result.current.register('input');
        result.current.setError('input', {
          type: 'test',
          message: 'message',
        });
      });

      act(() => result.current.clearErrors('input'));

      expect(result.current.formState.errors).toEqual({});
    });

    it('should remove nested error', () => {
      const { result } = renderHook(() =>
        useForm<{ input: { nested: string } }>(),
      );
      act(() =>
        result.current.setError('input.nested', {
          type: 'test',
        }),
      );
      expect(result.current.formState.errors.input?.nested).toBeDefined();
      act(() => result.current.clearErrors('input.nested'));
      expect(result.current.formState.errors.input?.nested).toBeUndefined();
    });

    it('should remove deep nested error and set it to undefined', async () => {
      let currentErrors = {};

      const Component = () => {
        const {
          register,
          formState: { errors },
          trigger,
          clearErrors,
        } = useForm<{
          test: { data: string };
        }>();

        currentErrors = errors;
        return (
          <div>
            <input type="text" {...register('test.data', { required: true })} />
            <button type={'button'} onClick={() => trigger()}>
              submit
            </button>
            <button type={'button'} onClick={() => clearErrors(['test.data'])}>
              clear
            </button>
          </div>
        );
      };

      await actComponent(async () => {
        render(<Component />);
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      expect(currentErrors).toMatchSnapshot();

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'clear' }));
      });

      expect(currentErrors).toEqual({});
    });

    it('should remove specified errors', () => {
      const { result } = renderHook(() =>
        useForm<{
          input: string;
          input1: string;
          input2: string;
          nest: { data: string; data1: string };
        }>(),
      );

      const error = {
        type: 'test',
        message: 'message',
      };

      act(() => {
        result.current.register('input');
        result.current.register('input1');
        result.current.register('input2');
        result.current.setError('input', error);
        result.current.setError('input1', error);
        result.current.setError('input2', error);

        result.current.register('nest.data');
        result.current.register('nest.data1');
        result.current.setError('nest.data', error);
        result.current.setError('nest.data1', error);
      });

      const errors = {
        input: {
          ...error,
          ref: {
            name: 'input',
          },
        },
        input1: {
          ...error,
          ref: {
            name: 'input1',
          },
        },
        input2: {
          ...error,
          ref: {
            name: 'input2',
          },
        },
        nest: {
          data: {
            ...error,
            ref: {
              name: 'nest.data',
            },
          },
          data1: {
            ...error,
            ref: {
              name: 'nest.data1',
            },
          },
        },
      };
      expect(result.current.formState.errors).toEqual(errors);

      act(() => result.current.clearErrors(['input', 'input1', 'nest.data']));
      expect(result.current.formState.errors).toEqual({
        input2: errors.input2,
        nest: {
          data1: errors.nest.data1,
        },
      });
    });

    it('should remove all error', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; input1: string; input2: string }>(),
      );

      const error = {
        type: 'test',
        message: 'message',
      };
      act(() => result.current.setError('input', error));
      act(() => result.current.setError('input1', error));
      act(() => result.current.setError('input2', error));
      expect(result.current.formState.errors).toEqual({
        input: {
          ...error,
          ref: undefined,
          types: undefined,
        },
        input1: {
          ...error,
          ref: undefined,
          types: undefined,
        },
        input2: {
          ...error,
          ref: undefined,
          types: undefined,
        },
      });

      act(() => result.current.clearErrors());
      expect(result.current.formState.errors).toEqual({});
    });

    it('should prevent the submission if there is a custom error', async () => {
      const submit = jest.fn();
      const { result } = renderHook(() =>
        useForm<{ data: string; whatever: string }>(),
      );

      result.current.register('data');

      act(() => {
        result.current.setError('whatever', { type: 'missing' });
      });

      await act(async () => await result.current.handleSubmit(submit)());
      expect(submit).not.toBeCalled();

      act(() => {
        result.current.clearErrors('whatever');
      });

      await act(async () => await result.current.handleSubmit(submit)());
      expect(submit).toBeCalled();
    });
  });

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
            if (data.test) {
              return {
                values: data,
                errors: {},
              };
            }
            return {
              values: {},
              errors: {
                test: 'issue',
              } as any,
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

      // @ts-ignore
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

  describe('when errors changes', () => {
    it('should display the latest error message', async () => {
      const Form = () => {
        const {
          register,
          setError,
          formState: { errors },
        } = useForm<{
          test: string;
        }>();

        React.useEffect(() => {
          setError('test', {
            type: 'data',
            message: 'data',
          });
        }, [setError]);

        return (
          <div>
            <input
              {...register('test', {
                maxLength: {
                  message: 'max',
                  value: 3,
                },
              })}
              placeholder="test"
              type="text"
            />
            <span role="alert">{errors.test && errors.test.message}</span>
          </div>
        );
      };

      render(<Form />);

      const span = screen.getByRole('alert');

      await waitFor(() => expect(span.textContent).toBe('data'));

      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });

      await waitFor(() => expect(span.textContent).toBe('data'));
    });
  });

  describe('handleChangeRef', () => {
    let renderCount: PerfTools<{ Component: unknown }>['renderCount'];
    let Component: React.FC<{
      name?: string;
      resolver?: any;
      mode?: 'onBlur' | 'onSubmit' | 'onChange';
      rules?: RegisterOptions;
    }>;
    let methods: UseFormMethods<{ test: string }>;

    beforeEach(() => {
      Component = ({
        name = 'test',
        resolver,
        mode,
        rules = { required: 'required' },
      }: {
        name?: string;
        resolver?: any;
        mode?: 'onBlur' | 'onSubmit' | 'onChange';
        rules?: RegisterOptions;
      }) => {
        const internationalMethods = useForm<{ test: string }>({
          resolver,
          mode,
        });
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = internationalMethods;
        methods = internationalMethods;

        return (
          <div>
            <input
              type="text"
              {...register(name as any, resolver ? {} : rules)}
            />
            <span role="alert">
              {errors?.test?.message && errors.test.message}
            </span>
            <button onClick={handleSubmit(() => {})}>button</button>
          </div>
        );
      };

      const tools = perf<{ Component: unknown }>(React);
      renderCount = tools.renderCount;
    });

    describe('onSubmit mode', () => {
      it('should not contain error if value is valid', async () => {
        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        });

        await actComponent(async () => {
          await fireEvent.click(screen.getByRole('button'));
        });

        expect(screen.getByRole('alert').textContent).toBe('');

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'test', value: 'test' },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(3),
        );
      });

      it('should not contain error if name is invalid', async () => {
        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        });

        await actComponent(async () => {
          await fireEvent.click(screen.getByRole('button'));
        });

        expect(screen.getByRole('alert').textContent).toBe('');

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'wrongName', value: '' },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(3),
        );
      });

      it('should contain error if value is invalid with revalidateMode is onChange', async () => {
        render(<Component />);

        const input = screen.getByRole('textbox');

        fireEvent.input(input, { target: { name: 'test', value: 'test' } });

        await actComponent(async () => {
          await fireEvent.click(screen.getByRole('button'));
        });

        expect(screen.getByRole('alert').textContent).toBe('');

        fireEvent.input(input, { target: { name: 'test', value: '' } });

        await waitFor(() =>
          expect(screen.getByRole('alert').textContent).toBe('required'),
        );

        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(4),
        );
      });

      it('should not call reRender method if the current error is the same as the previous error', async () => {
        render(<Component />);

        const input = screen.getByRole('textbox');

        fireEvent.input(input, { target: { name: 'test', value: '' } });

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() =>
          expect(screen.getByRole('alert').textContent).toBe('required'),
        );

        await actComponent(async () => {
          await fireEvent.input(input, { target: { name: 'test', value: '' } });
        });

        expect(screen.getByRole('alert').textContent).toBe('required');
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });

      it('should set name to formState.touched when formState.touched is defined', async () => {
        render(<Component rules={{}} />);

        methods.formState.touched;

        await actComponent(async () => {
          await fireEvent.click(screen.getByRole('button'));
        });

        fireEvent.blur(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        });

        await waitFor(() =>
          expect(methods.formState.touched).toEqual({
            test: true,
          }),
        );
        expect(screen.getByRole('alert').textContent).toBe('');
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(4),
        );
      });

      // check https://github.com/react-hook-form/react-hook-form/issues/2153
      it('should perform correct behavior when reValidateMode is onBlur', async () => {
        const Component = () => {
          const {
            register,
            handleSubmit,
            formState: { errors },
          } = useForm<{
            test: string;
          }>({
            reValidateMode: 'onBlur',
          });
          return (
            <form onSubmit={handleSubmit(() => {})}>
              <input type="text" {...register('test', { required: true })} />
              {errors.test && <span role="alert">required</span>}
              <button>submit</button>
            </form>
          );
        };

        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: {
            value: 'test',
          },
        });

        await actComponent(async () => {
          await fireEvent.click(
            screen.getByRole('button', { name: /submit/i }),
          );
        });

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { value: '' },
          });
        });

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();

        await actComponent(async () => {
          await fireEvent.blur(screen.getByRole('textbox'));
        });

        expect(screen.queryByRole('alert')).toBeInTheDocument();
      });

      it.skip('should output error message when formState.isValid is called in development environment', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'development';

        const { result } = renderHook(() => useForm());

        result.current.formState.isValid;

        expect(console.warn).toBeCalledTimes(1);

        // @ts-ignore
        console.warn.mockRestore();
      });

      it('should not output error message when formState.isValid is called in production environment', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'production';

        const { result } = renderHook(() => useForm());

        result.current.formState.isValid;

        expect(console.warn).not.toBeCalled();

        // @ts-ignore
        console.warn.mockRestore();
      });
    });

    describe('onChange', () => {
      it('should display error with onChange', async () => {
        render(<Component mode="onChange" />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        });

        await waitFor(() =>
          expect(screen.getByRole('alert').textContent).toBe('required'),
        );
      });

      it('should display error with onSubmit', async () => {
        render(<Component mode="onChange" />);

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() =>
          expect(screen.getByRole('alert').textContent).toBe('required'),
        );
      });

      it('should not display error with onBlur', async () => {
        render(<Component mode="onChange" />);

        await actComponent(async () => {
          fireEvent.blur(screen.getByRole('textbox'), {
            target: {
              value: '',
            },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
      });

      it('should not output error message when formState.isValid is called', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'development';

        const { result } = renderHook(() =>
          useForm({ mode: VALIDATION_MODE.onChange }),
        );

        result.current.formState.isValid;

        expect(console.warn).not.toBeCalled();

        // @ts-ignore
        console.warn.mockRestore();
      });
    });

    describe('onBlur', () => {
      it('should display error with onBlur', async () => {
        render(<Component mode="onBlur" />);

        fireEvent.blur(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        });

        await waitFor(() =>
          expect(screen.getByRole('alert').textContent).toBe('required'),
        );
      });

      it('should display error with onSubmit', async () => {
        render(<Component mode="onBlur" />);

        fireEvent.click(screen.getByRole('button'));

        await waitFor(() =>
          expect(screen.getByRole('alert').textContent).toBe('required'),
        );
      });

      it('should not display error with onChange', async () => {
        render(<Component mode="onBlur" />);

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: {
              value: '',
            },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
      });

      it('should not output error message when formState.isValid is called', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'development';

        const { result } = renderHook(() =>
          useForm({ mode: VALIDATION_MODE.onBlur }),
        );

        result.current.formState.isValid;

        expect(console.warn).not.toBeCalled();

        // @ts-ignore
        console.warn.mockRestore();
      });
    });

    describe('with watch', () => {
      it('should be return undefined or null value', () => {
        const { result } = renderHook(() =>
          useForm<{
            test: string;
            test1: string;
          }>(),
        );

        result.current.register('test');
        result.current.register('test1');

        const test = result.current.watch('test');
        const test1 = result.current.watch('test1');

        expect(test).toBeNull();
        expect(test1).toBeUndefined();
      });

      it('should be called reRender method if isWatchAllRef is true', async () => {
        let watchedField: any;
        const Component = () => {
          const { register, handleSubmit, watch } = useForm<{
            test: string;
          }>();
          watchedField = watch();
          return (
            <form onSubmit={handleSubmit(() => {})}>
              <input {...register('test')} />
              <button>button</button>
            </form>
          );
        };
        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        });

        expect(watchedField).toEqual({ test: 'test' });
      });

      it('should be called reRender method if field is watched', async () => {
        let watchedField: any;
        const Component = () => {
          const { register, handleSubmit, watch } = useForm<{
            test: string;
          }>();
          watchedField = watch('test');
          return (
            <form onSubmit={handleSubmit(() => {})}>
              <input {...register('test')} />
              <button>button</button>
            </form>
          );
        };
        render(<Component />);

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        });

        expect(watchedField).toBe('test');
      });

      it('should be called reRender method if array field is watched', async () => {
        let watchedField: any;
        const Component = () => {
          const { register, handleSubmit, watch } = useForm<{
            test: string[];
          }>();
          watchedField = watch('test');
          return (
            <form onSubmit={handleSubmit(() => {})}>
              <input {...register('test.0')} />
              <input {...register('test.1')} />
              <input {...register('test.2')} />
              <button>button</button>
            </form>
          );
        };
        render(<Component />);

        fireEvent.input(screen.getAllByRole('textbox')[0], {
          target: { name: 'test[0]', value: 'test' },
        });

        expect(watchedField).toEqual(['test', '', '']);
      });
    });

    describe('with resolver', () => {
      it('should contain error if value is invalid with resolver', async () => {
        const mockResolver = jest.fn();
        const resolver = async (data: any) => {
          if (data.test) {
            return { values: data, errors: {} };
          }
          mockResolver();
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          };
        };

        render(<Component resolver={resolver} mode="onChange" />);

        methods.formState.isValid;

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'test', value: 'test' },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
        expect(methods.formState.isValid).toBeTruthy();

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'test', value: '' },
          });
        });

        await waitFor(() => expect(mockResolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('resolver error');
        expect(methods.formState.isValid).toBeFalsy();
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });

      it('with sync resolver it should contain error if value is invalid with resolver', async () => {
        const mockResolver = jest.fn();
        const resolver = (data: any) => {
          if (data.test) {
            return { values: data, errors: {} };
          }
          mockResolver();
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          };
        };

        render(<Component resolver={resolver} mode="onChange" />);

        methods.formState.isValid;

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'test', value: 'test' },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
        expect(methods.formState.isValid).toBeTruthy();

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: '' },
        });

        await waitFor(() => expect(mockResolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('resolver error');
        expect(methods.formState.isValid).toBeFalsy();
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });

      it('should make isValid change to false if it contain error that is not related name with onChange mode', async () => {
        const mockResolver = jest.fn();
        const resolver = async (data: any) => {
          if (data.test) {
            return { values: data, errors: {} };
          }
          mockResolver();
          return {
            values: data,
            errors: {
              notRelatedName: {
                message: 'resolver error',
              },
            },
          };
        };

        render(<Component resolver={resolver} mode="onChange" />);

        methods.formState.isValid;

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'test', value: 'test' },
          });
        });

        expect(screen.getByRole('alert').textContent).toBe('');
        expect(methods.formState.isValid).toBeTruthy();

        fireEvent.input(screen.getByRole('textbox'), {
          target: { name: 'test', value: '' },
        });

        await waitFor(() => expect(mockResolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(methods.formState.isValid).toBeFalsy();
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });
    });
  });

  describe('updateIsValid', () => {
    it('should be defined when resolver is defined', () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() => useForm({ resolver }));

      expect(result.current.control.updateIsValid).toBeDefined();
    });

    it.only('should be called resolver with default values if default value is defined', async () => {
      let resolverData: any;
      const resolver = async (data: any) => {
        resolverData = data;
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm({
          resolver,
          defaultValues: { test: 'default' },
        }),
      );

      const { ref } = result.current.register('test');

      isFunction(ref) &&
        ref({
          target: {
            value: '',
          },
        });

      await act(async () => {
        await result.current.control.updateIsValid({});
      });

      expect(resolverData).toEqual({
        test: 'default',
      });
    });

    it('should be called resolver with field values if value is undefined', async () => {
      let resolverData: any;
      const resolver = async (data: any) => {
        resolverData = data;
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{
          test: string;
        }>({
          resolver,
        }),
      );

      result.current.register('test');

      result.current.setValue('test', 'value');

      await act(async () => {
        result.current.control.updateIsValid({});
      });

      expect(resolverData).toEqual({ test: 'value' });
    });
  });

  describe('mode with onTouched', () => {
    it('should validate form only when input is been touched', async () => {
      const Component = () => {
        const {
          register,
          formState: { errors },
        } = useForm<{
          test: string;
        }>({
          mode: 'onTouched',
        });

        return (
          <>
            <input
              type="text"
              {...register('test', { required: 'This is required.' })}
            />
            {errors.test?.message}
          </>
        );
      };

      render(<Component />);

      screen.getByRole('textbox').focus();

      await actComponent(async () => {
        await fireEvent.blur(screen.getByRole('textbox'));
      });

      expect(screen.queryByText('This is required.')).toBeInTheDocument();

      await actComponent(async () => {
        await fireEvent.input(screen.getByRole('textbox'), {
          target: {
            value: 'test',
          },
        });
      });

      expect(screen.queryByText('This is required.')).not.toBeInTheDocument();

      await actComponent(async () => {
        fireEvent.input(screen.getByRole('textbox'), {
          target: {
            value: '',
          },
        });
      });

      expect(screen.queryByText('This is required.')).toBeInTheDocument();
    });
  });

  describe('with schema validation', () => {
    it('should trigger and clear errors for group errors object', async () => {
      let errorsObject = {};

      const Component = () => {
        const {
          formState: { errors },
          register,
          handleSubmit,
        } = useForm<{
          checkbox: string[];
        }>({
          mode: 'onChange',
          resolver: (data) => {
            return {
              errors: {
                ...(data.checkbox.every((value) => !value)
                  ? { checkbox: { type: 'error', message: 'wrong' } as any }
                  : {}),
              },
              values: {},
            };
          },
        });
        errorsObject = errors;

        {
          /* todo: Type is still not working as expected here */
        }

        return (
          <form onSubmit={handleSubmit(() => {})}>
            {[1, 2, 3].map((value, index) => (
              <div key={`test.${index}`}>
                <label
                  htmlFor={`checkbox.${index}`}
                >{`checkbox.${index}`}</label>
                <input
                  type={'checkbox'}
                  key={index}
                  id={`checkbox.${index}`}
                  {...register(`checkbox.${index}` as any)}
                  value={value}
                />
              </div>
            ))}

            <button>Submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByLabelText('checkbox[0]'));

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox[0]'));
      });

      expect(errorsObject).toEqual({
        checkbox: { type: 'error', message: 'wrong' },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox[0]'));
      });

      expect(errorsObject).toEqual({});

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox[0]'));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(errorsObject).toEqual({
        checkbox: { type: 'error', message: 'wrong' },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox[0]'));
      });

      expect(errorsObject).toEqual({});
    });
  });

  describe('control', () => {
    it('does not change across re-renders', () => {
      let control;

      const Component = () => {
        const form = useForm<{
          test: string;
        }>();

        control = form.control;

        return (
          <>
            <input type="text" {...form.register('test')} />
          </>
        );
      };

      const { rerender } = render(<Component />);

      const firstRenderControl = control;

      rerender(<Component />);

      const secondRenderControl = control;

      expect(Object.is(firstRenderControl, secondRenderControl)).toBe(true);
    });
  });
});
