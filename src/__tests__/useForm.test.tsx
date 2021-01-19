import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import {
  render,
  fireEvent,
  waitFor,
  act as actComponent,
  screen,
} from '@testing-library/react';
import { perf, wait, PerfTools } from 'react-performance-testing';
import 'jest-performance-testing';
import isFunction from '../utils/isFunction';
import { useForm } from '../';
import { VALIDATION_MODE } from '../constants';
import { NestedValue, UseFormMethods, RegisterOptions } from '../types';

let nodeEnv: string | undefined;

describe('useForm', () => {
  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv;
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

      it('should not output error message when formState.isValid is called in production environment', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'production';

        const { result } = renderHook(() => useForm());

        result.current.formState.isValid;

        expect(console.warn).not.toBeCalled();
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

      it('should not output error message when formState.isValid is called', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'development';

        const { result } = renderHook(() =>
          useForm({ mode: VALIDATION_MODE.onChange }),
        );

        result.current.formState.isValid;

        expect(console.warn).not.toBeCalled();
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
          expect(renderCount.current.Component).toBeRenderedTimes(3),
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
          expect(renderCount.current.Component).toBeRenderedTimes(3),
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
          expect(renderCount.current.Component).toBeRenderedTimes(3),
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

        expect(resolver.mock.calls).toMatchInlineSnapshot(`
          Array [
            Array [
              Object {
                "test": "test",
              },
              undefined,
              Object {
                "criteriaMode": undefined,
                "fields": Array [
                  Object {
                    "name": "test",
                    "ref": <input
                      name="test"
                      type="text"
                    />,
                    "value": "test",
                  },
                ],
              },
            ],
          ]
        `);

        await actComponent(async () => {
          await fireEvent.click(screen.getByText(/button/i));
        });
        expect(resolver).toHaveBeenNthCalledWith(
          2,
          { test: 'test' },
          undefined,
          { criteriaMode: undefined },
        );
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

        expect(resolver).toHaveBeenCalledWith(defaultValues, undefined, {
          criteriaMode: undefined,
          fields: [
            {
              name: 'test.sub',
              ref: { name: 'test.sub', value: 'test' },
              value: 'test',
            },
          ],
        });

        // `trigger` to validate all field
        await act(async () => {
          result.current.trigger();
        });

        expect(resolver).toHaveBeenNthCalledWith(2, defaultValues, undefined, {
          criteriaMode: undefined,
          field: undefined,
        });

        // `trigger` to validate all field
        await act(async () => {
          result.current.trigger(['test.sub', 'test1']);
        });

        expect(resolver).toHaveBeenNthCalledWith(3, defaultValues, undefined, {
          criteriaMode: undefined,
          fields: [
            {
              name: 'test.sub',
              ref: { name: 'test.sub', value: 'test' },
              value: 'test',
            },
            {
              name: 'test1',
              ref: { name: 'test1', value: 'test1' },
              value: 'test1',
            },
          ],
        });
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

    it('should be called resolver with default values if default value is defined', async () => {
      const defaultValues = { test: 'default' };
      const resolver = jest.fn(async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      });

      const { result } = renderHook(() =>
        useForm({
          resolver,
          defaultValues,
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

      expect(resolver).toHaveBeenCalledWith(defaultValues, undefined, {
        criteriaMode: undefined,
      });
    });

    it('should be called resolver with field values if value is undefined', async () => {
      const resolver = jest.fn(async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      });

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

      expect(resolver).toHaveBeenCalledWith({ test: 'value' }, undefined, {
        criteriaMode: undefined,
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
