import * as React from 'react';
import {
  render,
  screen,
  fireEvent,
  act as actComponent,
  waitFor,
} from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useForm } from '../useForm';
import { useWatch } from '../useWatch';
import * as generateId from '../logic/generateId';
import { FormProvider } from '../useFormContext';
import { useFieldArray } from '../useFieldArray';
import { Control, UseFormMethods } from '../types';
import { perf, wait } from 'react-performance-testing';
import 'jest-performance-testing';

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

let nodeEnv: string | undefined;

describe.skip('useWatch', () => {
  beforeEach(() => {
    mockGenerateId();
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    (generateId.default as jest.Mock<any>).mockRestore();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    process.env.NODE_ENV = nodeEnv;
  });

  describe('initialize', () => {
    it('should return default value in useForm', () => {
      let method: any;
      let watched: any;
      const Component = () => {
        method = useForm<{ test: string }>({ defaultValues: { test: 'test' } });
        watched = useWatch({ control: method.control });
        return <div />;
      };
      render(<Component />);

      expect(watched).toEqual({ test: 'test' });
    });

    it('should return default value in useWatch', () => {
      const { result } = renderHook(() => {
        const { control } = useForm<{ test: string }>();
        return useWatch({
          control,
          name: 'test',
          defaultValue: 'test',
        });
      });

      expect(result.current).toEqual('test');
    });

    it('should return default value for single input', () => {
      const { result } = renderHook(() => {
        const { control } = useForm<{ test: string; test1: string }>({
          defaultValues: {
            test: 'test',
            test1: 'test1',
          },
        });
        return useWatch({
          control,
          name: 'test',
        });
      });

      expect(result.current).toEqual('test');
    });

    it('should return default values for array of inputs', () => {
      const { result } = renderHook(() => {
        const { control } = useForm<{ test: string; test1: string }>({
          defaultValues: {
            test: 'test',
            test1: 'test1',
          },
        });
        return useWatch({
          control,
          name: ['test', 'test1'],
        });
      });

      expect(result.current).toEqual({ test: 'test', test1: 'test1' });
    });

    it('should return default value when name is undefined', () => {
      const { result } = renderHook(() => {
        const { control } = useForm<{ test: string; test1: string }>({
          defaultValues: {
            test: 'test',
            test1: 'test1',
          },
        });
        return useWatch({
          control,
        });
      });

      expect(result.current).toEqual({ test: 'test', test1: 'test1' });
    });

    it('should return empty object', () => {
      const { result } = renderHook(() => {
        const { control } = useForm<{ test: string }>();
        return useWatch({
          control,
          name: ['test'],
        });
      });

      expect(result.current).toEqual({});
    });

    it('should return undefined', () => {
      const { result } = renderHook(() => {
        const { control } = useForm<{ test: string }>();
        return useWatch({
          control,
          name: 'test',
        });
      });

      expect(result.current).toBeUndefined();
    });

    it('should render with FormProvider', () => {
      const Provider: React.FC = ({ children }) => {
        const methods = useForm<{ test: string }>();
        return <FormProvider {...methods}>{children}</FormProvider>;
      };
      const { result } = renderHook(() => useWatch({ name: 'test' }), {
        wrapper: Provider,
      });
      expect(result.error).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should output error message when name is empty string in development mode', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';

      renderHook(() => {
        const { control } = useForm();
        useWatch({ control, name: '' });
      });

      expect(console.warn).toBeCalledTimes(1);
    });

    it('should not output error message when name is empty string in production mode', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'production';

      renderHook(() => {
        const { control } = useForm();
        useWatch({ control, name: '' });
      });

      expect(console.warn).not.toBeCalled();
    });

    it('should throw custom error when control is not defined in development mode', () => {
      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() => useWatch({ name: 'test' }));

      expect(result.error.message).toBe(
        '📋 useWatch is missing `control` prop. https://react-hook-form.com/api#useWatch',
      );
    });

    it('should throw TypeError when control is not defined in production mode', () => {
      process.env.NODE_ENV = 'production';

      const { result } = renderHook(() => useWatch({ name: 'test' }));

      expect(result.error.name).toBe(new TypeError().name);
    });
  });

  describe('update', () => {
    it('should partial re-render', async () => {
      type FormInputs = {
        child: string;
        parent: string;
      };

      const Child = ({
        register,
        control,
      }: Pick<UseFormMethods<FormInputs>, 'register' | 'control'>) => {
        useWatch({ name: 'child', control });
        return <input {...register('child')} />;
      };

      const Parent = () => {
        const {
          register,
          handleSubmit,
          control,
          formState: { errors },
        } = useForm<FormInputs>();
        return (
          <form onSubmit={handleSubmit(() => {})}>
            <input {...register('parent')} />
            <Child register={register} control={control} />
            {errors.parent}
            <button>submit</button>
          </form>
        );
      };

      const { renderCount } = perf<{
        Parent: unknown;
        Child: unknown;
      }>(React);

      render(<Parent />);

      const childInput = screen.getAllByRole('textbox')[1];

      fireEvent.input(childInput, {
        target: { value: 'test' },
      });

      await wait(() => {
        expect(renderCount.current.Parent).toBeRenderedTimes(1);
        expect(renderCount.current.Child).toBeRenderedTimes(2);
      });

      renderCount.current.Parent!.value = 0;
      renderCount.current.Child!.value = 0;

      await actComponent(async () => {
        await fireEvent.submit(screen.getByRole('button', { name: /submit/i }));
      });

      await wait(() => {
        expect(renderCount.current.Parent).toBeRenderedTimes(2);
        expect(renderCount.current.Child).toBeRenderedTimes(2);
      });

      renderCount.current.Parent!.value = 0;
      renderCount.current.Child!.value = 0;

      await actComponent(async () => {
        await fireEvent.input(childInput, { target: { value: 'test1' } });
      });

      await wait(() => {
        expect(renderCount.current.Parent).toBeRenderedTimes(0);
        expect(renderCount.current.Child).toBeRenderedTimes(1);
      });
    });

    it("should not re-render external component when field name don't match", async () => {
      type FormInputs = { test1: string; test2: string };

      const Child = ({ control }: { control: Control<FormInputs> }) => {
        useWatch({ name: 'test2', control });

        return <div />;
      };

      const Parent = () => {
        const { register, control } = useForm<FormInputs>();
        useWatch({ name: 'test1', control });

        return (
          <form>
            <input {...register('test1')} />
            <input {...register('test2')} />
            <Child control={control} />
          </form>
        );
      };

      const { renderCount } = perf<{ Parent: unknown; Child: unknown }>(React);

      render(<Parent />);

      fireEvent.input(screen.getAllByRole('textbox')[1], {
        target: {
          name: 'test2',
          value: 'value',
        },
      });

      await wait(() => expect(renderCount.current.Parent).toBeRenderedTimes(2));
    });

    it('should not throw error when null or undefined is set', () => {
      const watchedValue: Record<string, any> = {};
      const Component = () => {
        const { register, control } = useForm<{
          test: string;
          test1: string;
        }>();

        register('test');
        register('test1');

        watchedValue['test'] = useWatch({ name: 'test', control });
        watchedValue['test1'] = useWatch({ name: 'test1', control });

        return <div />;
      };

      render(<Component />);

      expect(watchedValue).toEqual({ test: undefined, test1: undefined });
    });

    it('should return undefined when input gets unregistered', async () => {
      const Component = () => {
        const { register, control, unregister } = useForm<{ test: number }>();
        const [show, setShow] = React.useState(true);
        const data: any = useWatch({ name: 'test', control });

        return (
          <>
            {show && <input {...register('test')} />}
            <span>{data}</span>
            <button
              type="button"
              onClick={() => {
                unregister('test');
                setShow(false);
              }}
            >
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
  });

  describe('reset', () => {
    it('should return updated default value with watched field after reset', async () => {
      type FormValues = {
        test: string;
        name: string;
      };

      function Watcher({ control }: { control: Control<FormValues> }) {
        const testField = useWatch<FormValues, string>({
          name: 'test',
          control: control,
        });

        return <div>{testField}</div>;
      }

      function Component() {
        const { reset, control } = useForm<FormValues>({
          defaultValues: {
            test: '',
            name: '',
          },
        });

        React.useEffect(() => {
          reset({
            test: 'test',
          });
        }, [reset]);

        return <Watcher control={control} />;
      }

      render(<Component />);

      await waitFor(() => screen.getByText('test'));
    });

    it('should return default value of reset method', async () => {
      const Component = () => {
        const { register, reset, control } = useForm<{
          test: string;
        }>();
        const test = useWatch<
          {
            test: string;
          },
          string
        >({ name: 'test', control });

        React.useEffect(() => {
          reset({ test: 'default' });
        }, [reset]);

        return (
          <form>
            <input {...register('test')} />
            <span>{test}</span>
          </form>
        );
      };

      render(<Component />);

      expect(await screen.findByText('default')).toBeDefined();
    });

    describe('with useFieldArray', () => {
      // issue: https://github.com/react-hook-form/react-hook-form/issues/2229
      it('should return current value with radio type', async () => {
        let watchedValue: any;
        const Component = () => {
          const { register, reset, control } = useForm<{
            options: { option: string }[];
          }>();
          const { fields } = useFieldArray({ name: 'options', control });
          watchedValue = useWatch({
            control,
          });

          React.useEffect(() => {
            reset({
              options: [
                {
                  option: 'test',
                },
                {
                  option: 'test1',
                },
              ],
            });
          }, [reset]);

          return (
            <form>
              {fields.map((_, i) => (
                <div key={i.toString()}>
                  <input
                    type="radio"
                    value="yes"
                    {...register(`options.${i}.option` as const)}
                  />
                  <input
                    type="radio"
                    value="no"
                    {...register(`options.${i}.option` as const)}
                  />
                </div>
              ))}
            </form>
          );
        };

        render(<Component />);

        fireEvent.change(screen.getAllByRole('radio')[1], {
          target: {
            checked: true,
          },
        });

        actComponent(() => {
          expect(watchedValue).toEqual({
            options: [{ option: 'test' }, { option: 'test1' }],
          });
        });
      });

      it("should watch item correctly with useFieldArray's remove method", async () => {
        let watchedValue: { [x: string]: any } | undefined;
        const Component = () => {
          const { register, control } = useForm<{
            test: {
              firstName: string;
              lsatName: string;
            }[];
          }>({
            defaultValues: {
              test: [{ firstName: 'test' }, { firstName: 'test1' }],
            },
          });
          const { fields, remove } = useFieldArray({
            name: 'test',
            control,
          });
          watchedValue = useWatch({
            name: 'test',
            control,
          });

          return (
            <form>
              {fields.map((item, i) => (
                <div key={item.firstName}>
                  <input
                    type="input"
                    defaultValue={item.firstName}
                    {...register(`test.${i}.firstName` as const)}
                  />

                  <button type="button" onClick={() => remove(i)}>
                    remove
                  </button>
                </div>
              ))}
            </form>
          );
        };

        render(<Component />);

        expect(watchedValue).toEqual([
          { firstName: 'test' },
          { firstName: 'test1' },
        ]);

        fireEvent.click(screen.getAllByRole('button')[0]);

        expect(watchedValue).toEqual([{ firstName: 'test1' }]);
      });
    });

    describe('with custom register', () => {
      it('should return default value of reset method when value is not empty', async () => {
        const Component = () => {
          const { register, reset, control } = useForm<{
            test: string;
          }>();
          const test = useWatch<
            {
              test: string;
            },
            string
          >({
            name: 'test',
            control,
          });

          React.useEffect(() => {
            register('test');
          }, [register]);

          React.useEffect(() => {
            reset({ test: 'default1' });
          }, [reset]);

          return (
            <form>
              <input {...register('test')} />
              <span data-testid="result">{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect((await screen.findByTestId('result')).textContent).toBe(
          'default1',
        );
      });

      it('should return default value of reset method', async () => {
        const Component = () => {
          const { register, reset, control } = useForm<{
            test: string;
          }>();
          const test = useWatch<
            {
              test: string;
            },
            string
          >({ name: 'test', control });

          React.useEffect(() => {
            register('test');
          }, [register]);

          React.useEffect(() => {
            reset({ test: 'default' });
          }, [reset]);

          return (
            <form>
              <span>{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect(await screen.findByText('default')).toBeDefined();
      });

      it('should return default value', async () => {
        const Component = () => {
          const { register, reset, control } = useForm<{ test: string }>();
          const test = useWatch<{ test: string }, string>({
            name: 'test',
            defaultValue: 'test',
            control,
          });

          React.useEffect(() => {
            register('test');
          }, [register]);

          React.useEffect(() => {
            reset();
          }, [reset]);

          return (
            <form>
              <span>{test}</span>
            </form>
          );
        };

        render(<Component />);

        expect(await screen.findByText('test')).toBeDefined();
      });
    });
  });

  describe('formContext', () => {
    it('should work with form context', async () => {
      const Component = () => {
        const test = useWatch<{ test: string }, string>({ name: 'test' });
        return <div>{test}</div>;
      };

      const Form = () => {
        const methods = useForm<{ test: string }>({
          defaultValues: { test: 'test' },
        });

        return (
          <FormProvider {...methods}>
            <Component />
          </FormProvider>
        );
      };

      render(<Form />);

      expect(await screen.findByText('test')).toBeDefined();
    });
  });
});
