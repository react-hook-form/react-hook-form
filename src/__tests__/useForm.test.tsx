import 'jest-performance-testing';

import * as React from 'react';
import { perf, PerfTools, wait } from 'react-performance-testing';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { VALIDATION_MODE } from '../constants';
import {
  Control,
  NestedValue,
  RegisterOptions,
  UseFormRegister,
  UseFormReturn,
} from '../types';
import isFunction from '../utils/isFunction';
import { Controller, useFieldArray, useForm } from '../';

describe('useForm', () => {
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

        formState.touchedFields;

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

      expect(formState.touchedFields.test).toBeDefined();
      expect(formState.isDirty).toBeFalsy();

      unmount();

      expect(formState.touchedFields.test).toBeDefined();
      expect(formState.isDirty).toBeFalsy();
    });

    it('should update dirtyFields during unregister', () => {
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

      expect(formState.dirtyFields.test).toBeDefined();
      expect(formState.isDirty).toBeTruthy();

      unmount();

      expect(formState.dirtyFields.test).toBeDefined();
      expect(formState.isDirty).toBeTruthy();
    });
  });

  describe('when shouldUnregister set to true', () => {
    describe('with useFieldArray', () => {
      type FormValues = {
        test: string;
        test1: string;
        test2: {
          value: string;
        }[];
      };

      const Child = ({
        control,
        register,
      }: {
        control: Control<FormValues>;
        register: UseFormRegister<FormValues>;
      }) => {
        const { fields } = useFieldArray({
          control,
          name: 'test2',
          shouldUnregister: true,
        });

        return (
          <>
            {fields.map((field, i) => (
              <input
                key={field.id}
                {...register(`test2.${i}.value` as const)}
                defaultValue={field.value}
              />
            ))}
          </>
        );
      };

      it('should remove and unregister inputs when inputs gets unmounted', async () => {
        let submittedData: FormValues[] = [];
        submittedData = [];

        const Component = () => {
          const [show, setShow] = React.useState(true);
          const { register, handleSubmit, control } = useForm<FormValues>({
            shouldUnregister: true,
            defaultValues: {
              test: 'bill',
              test1: 'bill1',
              test2: [{ value: 'bill2' }],
            },
          });

          return (
            <form onSubmit={handleSubmit((data) => submittedData.push(data))}>
              {show && (
                <>
                  <input {...register('test')} />
                  <Controller
                    control={control}
                    render={({ field }) => <input {...field} />}
                    name={'test1'}
                  />
                  <Child control={control} register={register} />
                </>
              )}
              <button>Submit</button>
              <button type={'button'} onClick={() => setShow(false)}>
                Toggle
              </button>
            </form>
          );
        };

        render(<Component />);

        await actComponent(async () => {
          fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        });

        actComponent(() => {
          fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
        });

        await actComponent(async () => {
          fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
        });

        expect(submittedData).toMatchSnapshot();
      });
    });

    it('should keep validation during unmount', async () => {
      function Component() {
        const {
          register,
          handleSubmit,
          watch,
          formState: { errors },
        } = useForm<{
          firstName: string;
          moreDetail: boolean;
        }>({
          shouldUnregister: true,
        });
        const moreDetail = watch('moreDetail');

        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input
              placeholder="firstName"
              {...register('firstName', { maxLength: 3 })}
            />
            {errors.firstName && <p>max length</p>}
            <input
              type="checkbox"
              {...register('moreDetail')}
              placeholder={'checkbox'}
            />

            {moreDetail && <p>show more</p>}
            <button>Submit</button>
          </form>
        );
      }

      render(<Component />);

      fireEvent.change(screen.getByPlaceholderText('firstName'), {
        target: {
          value: 'testtesttest',
        },
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('max length');

      fireEvent.click(screen.getByPlaceholderText('checkbox'));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      screen.getByText('max length');
    });

    it('should only unregister inputs when all checkboxes are unmounted', async () => {
      let result;

      const Component = () => {
        const { register, handleSubmit } = useForm({
          shouldUnregister: true,
        });
        const [radio1, setRadio1] = React.useState(true);
        const [radio2, setRadio2] = React.useState(true);

        return (
          <form
            onSubmit={handleSubmit((data) => {
              result = data;
            })}
          >
            {radio1 && (
              <input {...register('test')} type={'radio'} value={'1'} />
            )}
            {radio2 && (
              <input {...register('test')} type={'radio'} value={'2'} />
            )}
            <button type={'button'} onClick={() => setRadio1(!radio1)}>
              setRadio1
            </button>
            <button type={'button'} onClick={() => setRadio2(!radio2)}>
              setRadio2
            </button>
            <button>Submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'setRadio1' }));

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      });

      expect(result).toEqual({ test: null });

      fireEvent.click(screen.getByRole('button', { name: 'setRadio2' }));

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      });

      expect(result).toEqual({});
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
    let methods: UseFormReturn<{ test: string }>;

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
              {...register(name as 'test', resolver ? {} : rules)}
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

      it('should set name to formState.touchedFields when formState.touchedFields is defined', async () => {
        render(<Component rules={{}} />);

        methods.formState.touchedFields;

        await actComponent(async () => {
          await fireEvent.click(screen.getByRole('button'));
        });

        fireEvent.blur(screen.getByRole('textbox'), {
          target: { name: 'test', value: 'test' },
        });

        await waitFor(() =>
          expect(methods.formState.touchedFields).toEqual({
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
    });

    describe('onChange', () => {
      it('should display error with onChange', async () => {
        render(<Component mode="onChange" />);

        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: ' ',
          },
        });

        fireEvent.change(screen.getByRole('textbox'), {
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
    });

    describe('with watch', () => {
      it('should be return undefined or null value', () => {
        const { result } = renderHook(() =>
          useForm<{
            test: string | null;
            test1?: string;
          }>(),
        );

        result.current.register('test');
        result.current.register('test1');

        act(() => {
          result.current.setValue('test', null);
        });

        act(() => {
          result.current.setValue('test1', undefined);
        });

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
          target: { name: 'test.0', value: 'test' },
        });

        expect(watchedField).toEqual(['test', '', '']);
      });
    });

    describe('with resolver', () => {
      it('should contain error if value is invalid with resolver', async () => {
        const resolver = jest.fn(async (data: any) => {
          if (data.test) {
            return { values: data, errors: {} };
          }
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          };
        });

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

        await waitFor(() => expect(resolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('resolver error');
        expect(methods.formState.isValid).toBeFalsy();
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });

      it('with sync resolver it should contain error if value is invalid with resolver', async () => {
        const resolver = jest.fn((data: any) => {
          if (data.test) {
            return { values: data, errors: {} };
          }
          return {
            values: data,
            errors: {
              test: {
                message: 'resolver error',
              },
            },
          };
        });

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

        await waitFor(() => expect(resolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('resolver error');
        expect(methods.formState.isValid).toBeFalsy();
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });

      it('should make isValid change to false if it contain error that is not related name with onChange mode', async () => {
        const resolver = jest.fn(async (data: any) => {
          if (data.test) {
            return { values: data, errors: {} };
          }
          return {
            values: data,
            errors: {
              notRelatedName: {
                message: 'resolver error',
              },
            },
          };
        });

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

        await waitFor(() => expect(resolver).toHaveBeenCalled());
        expect(screen.getByRole('alert').textContent).toBe('');
        expect(methods.formState.isValid).toBeFalsy();
        await wait(() =>
          expect(renderCount.current.Component).toBeRenderedTimes(2),
        );
      });

      it("should call the resolver with the field being validated when an input's value change", async () => {
        const resolver = jest.fn((values: any) => ({ values, errors: {} }));

        render(<Component resolver={resolver} mode="onChange" />);
        expect(resolver).not.toHaveBeenCalled();

        await actComponent(async () => {
          await fireEvent.input(screen.getByRole('textbox'), {
            target: { name: 'test', value: 'test' },
          });
        });

        expect(resolver.mock.calls).toMatchSnapshot();

        await actComponent(async () => {
          await fireEvent.click(screen.getByText(/button/i));
        });
        expect(resolver.mock.calls[1]).toMatchSnapshot();
      });

      it('should call the resolver with the field being validated when `trigger` is called', async () => {
        const resolver = jest.fn((values: any) => ({ values, errors: {} }));
        const defaultValues = { test: { sub: 'test' }, test1: 'test1' };

        const { result } = renderHook(() =>
          useForm<typeof defaultValues>({
            mode: VALIDATION_MODE.onChange,
            resolver,
            defaultValues,
          }),
        );

        expect(resolver).not.toHaveBeenCalled();

        await act(async () => {
          await result.current.register('test.sub');
          await result.current.register('test1');
        });

        // `trigger` called with a field name
        await act(async () => {
          result.current.trigger('test.sub');
        });

        const fields = {
          test: {
            sub: {
              name: 'test.sub',
              ref: { name: 'test.sub', value: 'test' },
              value: 'test',
            },
          },
          test1: {
            name: 'test1',
            ref: {
              name: 'test1',
              value: 'test1',
            },
            value: 'test1',
          },
        };

        expect(resolver).toHaveBeenCalledWith(defaultValues, undefined, {
          criteriaMode: undefined,
          fields,
          names: ['test.sub'],
        });

        // `trigger` called to validate all fields
        await act(async () => {
          result.current.trigger();
        });

        expect(resolver).toHaveBeenNthCalledWith(2, defaultValues, undefined, {
          criteriaMode: undefined,
          fields,
          names: [],
        });

        // `trigger` called to validate fields
        await act(async () => {
          result.current.trigger(['test.sub', 'test1']);
        });

        expect(resolver).toHaveBeenNthCalledWith(3, defaultValues, undefined, {
          criteriaMode: undefined,
          fields,
          names: ['test.sub', 'test1'],
        });
      });
    });
  });

  describe('updateIsValid', () => {
    it('should be called resolver with default values if default value is defined', async () => {
      type FormValues = {
        test: string;
      };

      const resolver = jest.fn(async (data: FormValues) => {
        return {
          values: data,
          errors: {},
        };
      });

      const { result } = renderHook(() =>
        useForm<FormValues>({
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
        await result.current.trigger();
      });

      expect(resolver).toHaveBeenCalledWith(
        {
          test: 'default',
        },
        undefined,
        {
          criteriaMode: undefined,
          fields: {
            test: {
              name: 'test',
              ref: {
                target: {
                  value: '',
                },
                value: 'default',
              },
              value: 'default',
            },
          },
          names: [],
        },
      );
    });

    it('should be called resolver with field values if value is undefined', async () => {
      type FormValues = {
        test: string;
      };

      const resolver = jest.fn(async (data: FormValues) => {
        return {
          values: data,
          errors: {},
        };
      });

      const { result } = renderHook(() =>
        useForm<FormValues>({
          resolver,
        }),
      );

      result.current.register('test');

      result.current.setValue('test', 'value');

      result.current.trigger();

      expect(resolver).toHaveBeenCalledWith({ test: 'value' }, undefined, {
        criteriaMode: undefined,
        fields: {
          test: {
            name: 'test',
            ref: { name: 'test', value: 'value' },
            value: 'value',
          },
        },
        names: [],
      });
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
          checkbox: NestedValue<string[]>;
        }>({
          mode: 'onChange',
          resolver: (data) => {
            return {
              errors: {
                ...(data.checkbox.every((value) => !value)
                  ? { checkbox: { type: 'error', message: 'wrong' } }
                  : {}),
              },
              values: {},
            };
          },
        });
        errorsObject = errors;

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
                  {...register(`checkbox.${index}` as const)}
                  value={value}
                />
              </div>
            ))}

            <button>Submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByLabelText('checkbox.0'));

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox.0'));
      });

      expect(errorsObject).toEqual({
        checkbox: { type: 'error', message: 'wrong' },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox.0'));
      });

      expect(errorsObject).toEqual({});

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox.0'));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(errorsObject).toEqual({
        checkbox: { type: 'error', message: 'wrong' },
      });

      await actComponent(async () => {
        await fireEvent.click(screen.getByLabelText('checkbox.0'));
      });

      expect(errorsObject).toEqual({});
    });

    it('should have formState.isValid equals true with defined default values after executing resolver', async () => {
      const Toggle = () => {
        const [toggle, setToggle] = React.useState(false);

        const { register, formState } = useForm({
          defaultValues: { test: 'Test' },
          mode: 'onChange',
          resolver: async (values) => {
            if (!values.test) {
              const result = {
                values: {},
                errors: {
                  test: {
                    type: 'required',
                  },
                },
              };
              return result;
            }

            return {
              values,
              errors: {},
            };
          },
        });

        return (
          <>
            <button onClick={() => setToggle(!toggle)}>Toggle</button>
            {toggle && <input id="test" {...register('test')} />}
            <button disabled={!formState.isValid}>Submit</button>
          </>
        );
      };

      render(<Toggle />);

      const toggle = async () =>
        await actComponent(async () => {
          await screen.getByText('Toggle').click();
        });

      // Show input and Submit button
      await toggle();

      expect(screen.getByText('Submit')).toBeEnabled();

      // Hide input and Submit button
      await toggle();
      // Show input and Submit button again
      await toggle();

      expect(screen.getByText('Submit')).toBeEnabled();
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
