import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { Controller } from '../../controller';
import {
  Control,
  NestedValue,
  UseFormRegister,
  UseFormReturn,
} from '../../types';
import { useController } from '../../useController';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

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
    let methods: UseFormReturn<{ test: string }>;
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

    actComponent(() => {
      screen
        .getAllByRole('checkbox')
        .forEach((checkbox) =>
          expect((checkbox as HTMLInputElement).checked).toBeTruthy(),
        );
    });
  });

  it('should reset the form if ref is HTMLElement and parent element is not form', async () => {
    const mockReset = jest.spyOn(window.HTMLFormElement.prototype, 'reset');
    let methods: UseFormReturn<{
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

    expect(result.current.control._defaultValues).toEqual({
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

  it('should not reset form values when keepValues is specified', () => {
    const Component = () => {
      const { register, reset } = useForm();

      return (
        <>
          <input {...register('test')} />
          <button
            type={'button'}
            onClick={() =>
              reset(undefined, {
                keepValues: true,
              })
            }
          >
            reset
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'test',
    );
  });

  it('should not reset form defaultValues when keepDefaultValues is specified', () => {
    const Component = () => {
      const {
        register,
        reset,
        formState: { isDirty },
      } = useForm({
        defaultValues: {
          test: 'test1',
        },
      });

      return (
        <>
          <input {...register('test')} />
          <p>{isDirty ? 'dirty' : ''}</p>
          <button
            type={'button'}
            onClick={() =>
              reset(undefined, {
                keepValues: true,
              })
            }
          >
            reset
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'test',
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test2',
      },
    });

    act(() => {
      screen.getByText('dirty');
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test1',
      },
    });

    expect(screen.queryByText('dirty')).toBeNull();
  });

  it('should not reset if keepStateOption is specified', async () => {
    let formState = {};

    const App = () => {
      const {
        register,
        handleSubmit,
        reset,
        formState: { touchedFields, errors, isDirty },
      } = useForm<{ test: string }>({
        defaultValues: {
          test: '',
        },
      });

      formState = { touchedFields, errors, isDirty };

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('test', { required: true, minLength: 3 })} />
          <button>submit</button>
          <button
            onClick={() => {
              reset(
                { test: '' },
                {
                  keepErrors: true,
                  keepDirty: true,
                  keepIsSubmitted: true,
                  keepTouched: true,
                  keepIsValid: true,
                  keepSubmitCount: true,
                },
              );
            }}
            type={'button'}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      await fireEvent.change(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });

      await fireEvent.blur(screen.getByRole('textbox'));

      await fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(formState).toMatchSnapshot();

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    });

    expect(formState).toMatchSnapshot();
  });

  it('should keep isValid state when keep option is presented', async () => {
    const App = () => {
      const {
        register,
        reset,
        formState: { isValid },
      } = useForm({
        mode: 'onChange',
      });

      return (
        <>
          <input {...register('test', { required: true })} />
          {isValid ? 'valid' : 'invalid'}
          <button
            onClick={() => {
              reset(
                {
                  test: 'test',
                },
                {
                  keepIsValid: true,
                },
              );
            }}
          >
            reset
          </button>
        </>
      );
    };

    render(<App />);

    await waitFor(() => {
      screen.getByText('invalid');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('invalid');
    });
  });

  it('should reset field array fine with empty value', async () => {
    let data: unknown;
    const Component = () => {
      const { control, register, reset, handleSubmit } = useForm<{
        test: {
          firstName: string;
          lastName: string;
        }[];
      }>();
      const { fields } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form
          onSubmit={handleSubmit((d) => {
            data = d;
          })}
        >
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`test.${index}.firstName` as const)} />
              <Controller
                control={control}
                name={`test.${index}.lastName` as const}
                render={({ field }) => <input {...field} />}
              />
            </div>
          ))}

          <button>submit</button>

          <button type={'button'} onClick={() => reset()}>
            reset
          </button>
          <button
            type={'button'}
            onClick={() =>
              reset({
                test: [{ firstName: 'test', lastName: 'test' }],
              })
            }
          >
            reset with value
          </button>
        </form>
      );
    };

    render(<Component />);

    screen.getByRole('button', { name: 'reset' }).click();

    await actComponent(async () => {
      screen.getByRole('button', { name: 'submit' }).click();
    });

    await expect(data).toEqual({});

    screen.getByRole('button', { name: 'reset with value' }).click();

    await actComponent(async () => {
      screen.getByRole('button', { name: 'submit' }).click();
    });

    await expect(data).toEqual({
      test: [{ firstName: 'test', lastName: 'test' }],
    });
  });

  it('should return reset nested value', () => {
    const getValuesResult: unknown[] = [];

    function App() {
      const [, update] = React.useState({});
      const { register, reset, getValues } = useForm<{
        names: { name: string }[];
      }>({
        defaultValues: {
          names: [{ name: 'test' }],
        },
      });

      React.useEffect(() => {
        reset({ names: [{ name: 'Bill' }, { name: 'Luo' }] });
      }, [reset]);

      getValuesResult.push(getValues());

      return (
        <form>
          <input {...register('names.0.name')} placeholder="Name" />
          <button type={'button'} onClick={() => update({})}>
            update
          </button>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect(getValuesResult).toMatchSnapshot();
  });

  it('should keep defaultValues after reset with shouldKeepDefaultValues', async () => {
    type FormValues = { test: string; test1: string };
    const ControlledInput = ({ control }: { control: Control<FormValues> }) => {
      const { field } = useController({
        name: 'test',
        control,
      });

      return <input {...field} />;
    };

    function App() {
      const { control, register, reset } = useForm<FormValues>({
        defaultValues: { test: 'test', test1: 'test1' },
      });
      const resetData = () => {
        reset({}, { keepDefaultValues: true });
      };

      return (
        <form>
          <ControlledInput control={control} />
          <input {...register('test1')} />
          <input type="button" onClick={resetData} value="Reset" />
        </form>
      );
    }

    render(<App />);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'data' },
    });

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'data' },
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('test');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('test1');
  });

  it('should allow to reset unmounted field array', () => {
    type FormValues = {
      test: { name: string }[];
    };

    const FieldArray = ({
      control,
      register,
    }: {
      control: Control<FormValues>;
      register: UseFormRegister<FormValues>;
    }) => {
      const { fields, append } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <div>
          {fields.map((field, index) => {
            return (
              <input
                key={field.id}
                {...register(`test.${index}.name` as const)}
              />
            );
          })}
          <button
            onClick={() => {
              append({ name: '' });
            }}
          >
            append
          </button>
        </div>
      );
    };

    const App = () => {
      const [show, setShow] = React.useState(true);
      const { control, register, reset } = useForm<FormValues>();

      return (
        <div>
          {show && <FieldArray control={control} register={register} />}
          <button
            onClick={() => {
              setShow(!show);
            }}
          >
            toggle
          </button>
          <button
            onClick={() => {
              reset({
                test: [{ name: 'test' }],
              });
            }}
          >
            reset
          </button>
        </div>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));
    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    expect(screen.getAllByRole('textbox').length).toEqual(2);

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getAllByRole('textbox').length).toEqual(1);
  });
});
