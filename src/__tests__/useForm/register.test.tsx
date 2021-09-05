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
import { Controller } from '../../controller';
import { ControllerRenderProps, UseFormRegister } from '../../types';
import { useForm } from '../../useForm';
import { FormProvider, useFormContext } from '../../useFormContext';
import isFunction from '../../utils/isFunction';
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

  it('should update isValid correctly with custom registered input', async () => {
    function Component() {
      const {
        register,
        setValue,
        formState: { isValid },
      } = useForm({
        defaultValues: { a: 'default', b: '' },
        mode: 'onChange',
      });

      React.useEffect(() => {
        register('a', {
          required: 'required',
        });
        register('b', {
          required: 'required',
        });
      }, [register]);

      return (
        <form>
          <input
            placeholder={'inputA'}
            onChange={({ target: { value } }) =>
              setValue('a', value, { shouldDirty: true, shouldValidate: true })
            }
          />
          <input
            placeholder={'inputB'}
            onChange={({ target: { value } }) =>
              setValue('b', value, { shouldDirty: true, shouldValidate: true })
            }
          />
          <div>{String(isValid)}</div>
        </form>
      );
    }

    render(<Component />);

    screen.getByText('false');

    await actComponent(async () => {
      fireEvent.input(screen.getByPlaceholderText('inputA'), {
        target: { value: 'test' },
      });
    });

    await waitFor(() => {
      screen.getByText('false');
    });

    await actComponent(async () => {
      fireEvent.input(screen.getByPlaceholderText('inputB'), {
        target: { value: 'test' },
      });
    });

    screen.getByText('true');
  });

  it('should custom register with value and can be updated', async () => {
    const App = () => {
      const [inputValue, setInput] = React.useState(1);
      const [data, setData] = React.useState('');
      const { handleSubmit, register, setValue } = useForm<{ test: string }>();

      React.useEffect(() => {
        register('test', {
          value: 'bill',
        });
      }, [register]);

      return (
        <form>
          <button
            type={'button'}
            onClick={handleSubmit((data) => {
              setData(data.test);
            })}
          >
            handleSubmit
          </button>
          <button
            type={'button'}
            onClick={() => {
              setValue('test', '1234');
              setInput(inputValue + 1);
            }}
          >
            update
          </button>
          <p>{data}</p>
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'handleSubmit' }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'update' }));
    });

    screen.getByText('bill');

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'handleSubmit' }));
    });

    screen.getByText('1234');
  });

  it('should not affect or check against defaultChecked inputs', async () => {
    type FormValues = Partial<{
      radio: string;
      checkbox: string[];
    }>;
    let output: FormValues;

    output = {};

    function Component() {
      const { register, handleSubmit } = useForm<FormValues>();

      return (
        <form
          onSubmit={handleSubmit((data) => {
            output = data;
          })}
        >
          <input {...register('radio')} type="radio" value="Yes" />
          <input
            {...register('radio')}
            type="radio"
            value="No"
            defaultChecked
          />
          <input {...register('checkbox')} type="checkbox" value="Yes" />
          <input
            {...register('checkbox')}
            type="checkbox"
            value="No"
            defaultChecked
          />
          <button />
        </form>
      );
    }

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(output).toEqual({
      checkbox: ['No'],
      radio: 'No',
    });
  });

  it('should remove input value and reference with shouldUnregister: true', () => {
    type FormValue = {
      test: string;
    };
    const watchedValue: FormValue[] = [];
    const Component = () => {
      const { register, watch } = useForm<FormValue>({
        defaultValues: {
          test: 'bill',
        },
      });
      const [show, setShow] = React.useState(true);
      watchedValue.push(watch());

      return (
        <>
          {show && <input {...register('test', { shouldUnregister: true })} />}
          <button onClick={() => setShow(false)}>hide</button>
        </>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    expect(watchedValue).toMatchSnapshot();
  });

  it('should keep defaultValue with shouldUnregister: true when input unmounts', () => {
    type FormValue = {
      test: string;
    };

    const Component = () => {
      const { register } = useForm<FormValue>({
        defaultValues: {
          test: 'bill',
        },
        shouldUnregister: true,
      });
      const [show, setShow] = React.useState(true);

      return (
        <>
          {show && <input {...register('test', { shouldUnregister: true })} />}
          <button onClick={() => setShow(!show)}>hide</button>
        </>
      );
    };

    render(<Component />);

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'bill',
    );

    fireEvent.click(screen.getByRole('button'));

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'bill',
    );
  });

  it('should skip register absent fields which are checkbox/radio inputs', async () => {
    let data: unknown;

    const App = () => {
      const { register, handleSubmit } = useForm({
        defaultValues: {
          test: ['1', '2', '3'],
          nested: {
            test: {},
            test1: [],
          },
        },
      });
      return (
        <form onSubmit={handleSubmit((d) => (data = d))}>
          <input type="checkbox" {...register('test')} value={'1'} />
          <input type="checkbox" {...register('test')} value={'2'} />
          <input type="checkbox" {...register('test')} value={'3'} />
          <button>Submit</button>
        </form>
      );
    };

    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(data).toEqual({
      nested: {
        test: {},
        test1: [],
      },
      test: ['1', '2', '3'],
    });

    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(data).toEqual({
      test: ['2', '3'],
      nested: {
        test: {},
        test1: [],
      },
    });
  });

  describe('register disabled', () => {
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
              disabled
              value={'test'}
              type={'checkbox'}
              {...register('test1')}
            />
            <input
              disabled
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
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(watchedData).toStrictEqual([
        {},
        {
          test: undefined,
          test1: undefined,
          test2: undefined,
          test3: undefined,
          test4: '1234',
        },
      ]);

      expect(outputData).toStrictEqual({
        test: undefined,
        test1: undefined,
        test2: undefined,
        test3: undefined,
        test4: '1234',
      });
    });

    it('should validate value after toggling enabled/disabled on input', async () => {
      const defaultValue = 'Test';
      const validate = jest.fn();
      const submit = jest.fn();
      const onSubmit = (values: unknown) => {
        submit(values);
      };

      const App = () => {
        const [editable, setEditable] = React.useState(false);
        const { register, handleSubmit } = useForm();

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              defaultValue={defaultValue}
              {...register('test', { validate, disabled: !editable })}
            />
            <button type="button" onClick={() => setEditable(!editable)}>
              Toggle Edit
            </button>
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<App />);

      expect(validate).toBeCalledTimes(0);

      fireEvent.click(screen.getByText('Toggle Edit'));
      await actComponent(async () => {
        fireEvent.click(screen.getByText('Submit'));
      });

      expect(validate).toBeCalledWith(defaultValue);
      expect(submit).toBeCalledWith({ test: defaultValue });

      fireEvent.click(screen.getByText('Toggle Edit'));
      await actComponent(async () => {
        fireEvent.click(screen.getByText('Submit'));
      });

      expect(submit).toBeCalledWith({ test: undefined });
    });

    it('should not throw errors with disabled input', async () => {
      const message = 'Must have at least one checked!';

      function Checkbox() {
        const { register } = useFormContext();

        return (
          <>
            <p>
              Must select:
              <input
                type="checkbox"
                value="test"
                {...register('test', {
                  disabled: false,
                  validate: (value) => {
                    return value && value.length > 0 ? true : message;
                  },
                })}
              />
              A
            </p>
          </>
        );
      }

      function App() {
        const formMethods = useForm({
          mode: 'onSubmit',
          defaultValues: { test: '' },
        });
        const { handleSubmit, formState } = formMethods;

        return (
          <>
            <FormProvider {...formMethods}>
              <form onSubmit={handleSubmit(() => {})}>
                <Checkbox />
                <button>Submit</button>
                <p>{formState.errors.test?.message}</p>
              </form>
            </FormProvider>
          </>
        );
      }

      render(<App />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(() => {
        screen.getByText(message);
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('checkbox'));
      });
      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });
      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByText(message)).toBeNull();
    });

    it('should work correctly with toggle disabled attribute and validation', async () => {
      type FormValues = {
        test: string;
      };

      function Input({
        disabled,
        register,
      }: {
        disabled: boolean;
        register: UseFormRegister<FormValues>;
      }) {
        const options = {
          disabled,
          validate: (value: string) => {
            return value && value.length > 0
              ? true
              : 'Must have at least one checked!';
          },
        };

        return (
          <input type="checkbox" value="a" {...register('test', options)} />
        );
      }

      const App = () => {
        const [value, setValue] = React.useState({});
        const [disabled, setDisabled] = React.useState(false);
        const {
          register,
          handleSubmit,
          formState: { errors },
        } = useForm();

        return (
          <form onSubmit={handleSubmit(setValue)}>
            <Input register={register} disabled={disabled} />
            {errors.test && <p>error</p>}
            <button type={'button'} onClick={() => setDisabled(!disabled)}>
              setDisabled
            </button>
            <button>submit</button>
            <p>{JSON.stringify(value)}</p>
          </form>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('checkbox'));

      fireEvent.click(screen.getByRole('button', { name: 'submit' }));

      await waitFor(async () => {
        screen.getByText('{"test":"a"}');
      });

      fireEvent.click(screen.getByRole('button', { name: 'setDisabled' }));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      await waitFor(async () => {
        screen.getByText('{}');
      });

      fireEvent.click(screen.getByRole('button', { name: 'setDisabled' }));

      fireEvent.click(screen.getByRole('button', { name: 'submit' }));

      await waitFor(async () => {
        screen.getByText('{"test":"a"}');
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
            {errors.test1 && <p>test1 error</p>}
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

    it('should still validate with an error existed', async () => {
      function App() {
        const {
          register,
          handleSubmit,
          setError,
          formState: { errors },
        } = useForm<{ firstName: string }>();
        const { name, ref, onBlur, onChange } = register('firstName');

        return (
          <form
            onSubmit={handleSubmit(() => {
              setError('firstName', {
                type: 'manual',
                message: 'Empty',
              });
            })}
          >
            <input
              placeholder="First Name"
              name={name}
              ref={ref}
              onBlur={onBlur}
              onChange={onChange}
            />
            {errors.firstName && <div>{errors.firstName.message}</div>}
            <input type="submit" />
          </form>
        );
      }

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(async () => {
        screen.getByText('Empty');
      });

      await actComponent(async () => {
        fireEvent.change(screen.getByRole('textbox'), {
          target: {
            value: 'test',
          },
        });
      });

      expect(screen.queryByText('Empty')).toBeNull();
    });
  });

  it('should not register nested input', () => {
    const watchedValue: unknown[] = [];
    let inputs: unknown;

    const Checkboxes = ({
      value,
      onChange,
    }: {
      value: boolean[];
      onChange: ControllerRenderProps['onChange'];
    }) => {
      const [checkboxValue, setCheckboxValue] = React.useState(value);

      return (
        <div>
          {value.map((_, index) => (
            <input
              key={index}
              onChange={(e) => {
                const updatedValue = checkboxValue.map((item, i) => {
                  if (index === i) {
                    return e.target.checked;
                  }
                  return item;
                });

                setCheckboxValue(updatedValue);
                onChange(updatedValue);
              }}
              type="checkbox"
              checked={checkboxValue[index]}
            />
          ))}
        </div>
      );
    };

    function App() {
      const { control, watch } = useForm({
        defaultValues: {
          test: [true, false, false],
        },
      });
      inputs = control._fields;
      watchedValue.push(watch());

      return (
        <form>
          <Controller
            name="test"
            control={control}
            render={({ field }) => (
              <Checkboxes onChange={field.onChange} value={field.value} />
            )}
          />
          <input type="submit" />
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    expect(watchedValue).toEqual([
      { test: [true, false, false] },
      { test: [false, false, false] },
    ]);

    expect(inputs).toMatchSnapshot();
  });

  describe('when setValueAs is presented with inputs', () => {
    it('should not update inputs correctly with useForm defaultValues', () => {
      const App = () => {
        const { register } = useForm({
          defaultValues: {
            test: '1234',
          },
        });
        return (
          <form>
            <input
              {...register('test', { setValueAs: (value) => value + '5' })}
            />
          </form>
        );
      };

      render(<App />);

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        '1234',
      );
    });

    it('should not update inputs correctly with reset', () => {
      const App = () => {
        const { register, reset } = useForm();

        React.useEffect(() => {
          reset({
            test: '1234',
          });
        }, [reset]);

        return (
          <form>
            <input
              {...register('test', { setValueAs: (value) => value + '5' })}
            />
          </form>
        );
      };

      render(<App />);

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        '1234',
      );
    });

    it('should populate input as string and submit as datetime object ', async () => {
      let submitData: unknown;

      const App = () => {
        const { register, handleSubmit } = useForm<{
          test: Date | string;
        }>({
          defaultValues: {
            test: '2020-10-10',
          },
        });

        return (
          <form
            onSubmit={handleSubmit((data) => {
              submitData = data;
            })}
          >
            <input {...register('test', { valueAsDate: true })} />
            <button>Submit</button>
          </form>
        );
      };

      render(<App />);

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        '2020-10-10',
      );

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(submitData).toEqual({
        test: new Date('2020-10-10'),
      });
    });
  });

  it('should not throw error when register with non input ref', () => {
    const App = () => {
      const { register } = useForm();

      return (
        <div {...register('test')}>
          <h1>test</h1>
        </div>
      );
    };

    render(<App />);
  });

  it('should be able to register input/textarea/select when embedded deeply', async () => {
    let submitData: unknown;

    const Select = React.forwardRef<HTMLDivElement>((_, ref) => {
      return (
        <div ref={ref}>
          <select data-testid="select">
            <option value={''}></option>
            <option value={'select'}>select</option>
          </select>
        </div>
      );
    });

    Select.displayName = 'Select';

    const Input = React.forwardRef<HTMLDivElement>((_, ref) => {
      return (
        <div ref={ref}>
          <input data-testid="input" />
        </div>
      );
    });

    Input.displayName = 'Input';

    const Textarea = React.forwardRef<HTMLDivElement>((_, ref) => {
      return (
        <div ref={ref}>
          <textarea data-testid="textarea" />
        </div>
      );
    });

    Textarea.displayName = 'Textarea';

    const App = () => {
      const { register, handleSubmit } = useForm({
        defaultValues: {
          input: 'input',
          select: 'select',
          textarea: 'textarea',
        },
      });

      return (
        <form
          onSubmit={handleSubmit((data) => {
            submitData = data;
          })}
        >
          <Input {...register('input')} />
          <Select {...register('select')} />
          <Textarea {...register('textarea')} />
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(submitData).toEqual({
      input: 'input',
      select: 'select',
      textarea: 'textarea',
    });

    expect((screen.getByTestId('input') as HTMLInputElement).value).toEqual(
      'input',
    );
    expect((screen.getByTestId('select') as HTMLSelectElement).value).toEqual(
      'select',
    );
    expect(
      (screen.getByTestId('textarea') as HTMLTextAreaElement).value,
    ).toEqual('textarea');
  });

  it('should should trigger deps validation', async () => {
    const App = () => {
      const { register, getValues, formState } = useForm<{
        firstName: string;
        lastName: string;
      }>({
        mode: 'onChange',
      });

      return (
        <div>
          <input
            {...register('firstName', {
              validate: (value) => {
                return getValues('lastName') === value;
              },
            })}
          />
          {formState.errors.firstName && <p>error</p>}
          <input {...register('lastName', { deps: ['firstName'] })} />
        </div>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: {
          value: 'test',
        },
      });
    });

    screen.getByText('error');

    await actComponent(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: {
          value: 'test',
        },
      });
    });

    expect(screen.queryByText('error')).toBeNull();
  });

  it('should should trigger deps validation with schema validation', async () => {
    const App = () => {
      const { register, formState } = useForm<{
        firstName: string;
        lastName: string;
      }>({
        mode: 'onChange',
        resolver: (values) => {
          if (values.firstName === values.lastName) {
            return {
              errors: {},
              values,
            };
          } else {
            return {
              errors: {
                firstName: {
                  type: 'error',
                },
                lastName: {
                  type: 'error',
                },
              },
              values,
            };
          }
        },
      });

      return (
        <div>
          <input {...register('firstName')} />
          {formState.errors.firstName && <p>firstName error</p>}
          <input {...register('lastName', { deps: ['firstName'] })} />
          {formState.errors.lastName && <p>lastName error</p>}
        </div>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: {
          value: 'test',
        },
      });
    });

    screen.getByText('firstName error');

    await actComponent(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: {
          value: 'test1',
        },
      });
    });

    screen.getByText('lastName error');

    await actComponent(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[1], {
        target: {
          value: 'test',
        },
      });
    });

    expect(screen.queryByText('error')).toBeNull();
  });

  it('should trigger custom onChange event', async () => {
    const onChange = jest.fn();

    const App = () => {
      const { register } = useForm();

      return (
        <form>
          <input {...register('test', { onChange })} />
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: {
          value: 'value',
        },
      });
    });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith(
      expect.objectContaining({
        bubbles: true,
        cancelable: false,
        currentTarget: null,
        type: 'change',
      }),
    );
  });

  it('should trigger custom onBlur event', async () => {
    const onBlur = jest.fn();

    const App = () => {
      const { register } = useForm();

      return (
        <form>
          <input {...register('test', { onBlur })} />
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.blur(screen.getAllByRole('textbox')[0]);
    });

    expect(onBlur).toBeCalledTimes(1);
    expect(onBlur).toBeCalledWith(
      expect.objectContaining({
        bubbles: true,
        cancelable: false,
        currentTarget: null,
        type: 'blur',
      }),
    );
  });
});
