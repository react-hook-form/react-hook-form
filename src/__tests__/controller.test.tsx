import * as React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

import { Controller } from '../controller';
import { ControllerRenderProps, NestedValue } from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';

function Input<TFieldValues>({
  onChange,
  onBlur,
  placeholder,
}: Pick<ControllerRenderProps<TFieldValues>, 'onChange' | 'onBlur'> & {
  placeholder?: string;
}) {
  return (
    <input
      placeholder={placeholder}
      onChange={() => onChange(1)}
      onBlur={() => onBlur()}
    />
  );
}

describe('Controller', () => {
  it('should render correctly with as with string', () => {
    const Component = () => {
      const { control } = useForm();
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    render(<Component />);

    const input = screen.queryByRole('textbox') as HTMLInputElement | null;

    expect(input).toBeInTheDocument();
    expect(input?.name).toBe('test');
  });

  it('should render correctly with as with component', () => {
    const Component = () => {
      const { control } = useForm();
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    render(<Component />);

    const input = screen.queryByRole('textbox') as HTMLInputElement | null;

    expect(input).toBeInTheDocument();
    expect(input?.name).toBe('test');
  });

  it('should reset value', async () => {
    const Component = () => {
      const { reset, control } = useForm();

      return (
        <>
          <Controller
            defaultValue="default"
            name="test"
            render={({ field }) => <input {...field} />}
            control={control}
          />
          <button
            type="button"
            onClick={() =>
              reset({
                test: 'default',
              })
            }
          >
            reset
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(screen.getByRole('textbox')).toHaveValue('test');

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(screen.getByRole('textbox')).toHaveValue('default');
  });

  it('should set defaultValue to value props when input was reset', () => {
    const Component = () => {
      const { reset, control } = useForm<{
        test: string;
      }>();

      React.useEffect(() => {
        reset({ test: 'default' });
      }, [reset]);

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    render(<Component />);

    expect(screen.getByRole('textbox')).toHaveValue('default');
  });

  it('should render when registered field values are updated', () => {
    const Component = () => {
      const { control } = useForm();
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } });

    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it("should trigger component's onChange method and invoke setValue method", () => {
    let fieldValues: unknown;
    const Component = () => {
      const { control, getValues } = useForm();

      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field }) => <input {...field} />}
            control={control}
          />
          <button onClick={() => (fieldValues = getValues())}>getValues</button>
        </>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });

    fireEvent.click(screen.getByRole('button', { name: /getValues/ }));

    expect(fieldValues).toEqual({ test: 'test' });
  });

  it("should trigger component's onChange method and invoke trigger method", async () => {
    let errors: any;
    const Component = () => {
      const { control, ...rest } = useForm({ mode: 'onChange' });

      errors = rest.formState.errors;

      return (
        <Controller
          defaultValue="test"
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
          rules={{ required: true }}
        />
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.input(screen.getByRole('textbox'), {
        target: { value: '' },
      });
    });

    expect(errors.test).toBeDefined();
  });

  it("should trigger component's onBlur method and invoke trigger method", async () => {
    let errors: any;
    const Component = () => {
      const { control, ...rest } = useForm({ mode: 'onBlur' });

      errors = rest.formState.errors;

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
          rules={{ required: true }}
        />
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.blur(screen.getByRole('textbox'), {
        target: { value: '' },
      });
    });

    expect(errors.test).toBeDefined();
  });

  it('should set field to formState.touchedFields', async () => {
    let touched: any;
    const Component = () => {
      const { control, formState } = useForm({ mode: 'onBlur' });

      touched = formState.touchedFields;

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    render(<Component />);

    await act(async () => {
      fireEvent.blur(screen.getByRole('textbox'));
    });

    expect(touched).toEqual({ test: true });
  });

  it('should call trigger method when re-validate mode is onBlur with blur event', async () => {
    const Component = () => {
      const {
        handleSubmit,
        control,
        formState: { errors },
      } = useForm({
        reValidateMode: 'onBlur',
      });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <Controller
            defaultValue=""
            name="test"
            render={({ field }) => <input {...field} />}
            control={control}
            rules={{ required: true }}
          />
          {errors.test && <span role="alert">required</span>}
          <button>submit</button>
        </form>
      );
    };
    render(<Component />);

    fireEvent.blur(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.submit(screen.getByRole('button'));
    });

    act(() => {
      fireEvent.input(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });
    });

    expect(screen.queryByRole('alert')).toBeInTheDocument();

    await act(async () => {
      fireEvent.blur(screen.getByRole('textbox'), {
        target: {
          value: 'test',
        },
      });
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should invoke custom event named method', () => {
    let fieldValues: any;
    const Component = () => {
      const { control, getValues } = useForm();
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field: props }) => {
              return <input {...props} />;
            }}
            control={control}
          />
          <button onClick={() => (fieldValues = getValues())}>getValues</button>
        </>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /getValues/ }));

    expect(fieldValues).toEqual({ test: 'test' });
  });

  it('should invoke custom onChange method', () => {
    const onChange = jest.fn();
    const Component = () => {
      const { control } = useForm<{
        test: string;
      }>();
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field: { onBlur, value } }) => {
              return (
                <Input placeholder="test" {...{ onChange, onBlur, value }} />
              );
            }}
            control={control}
          />
        </>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    expect(onChange).toBeCalled();
  });

  it('should invoke custom onChange method', () => {
    const onBlur = jest.fn();
    const Component = () => {
      const { control } = useForm();
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ field: { onChange, value } }) => {
              return <Input {...{ onChange, onBlur, value }} />;
            }}
            control={control}
          />
        </>
      );
    };

    render(<Component />);

    fireEvent.blur(screen.getByRole('textbox'));

    expect(onBlur).toBeCalled();
  });

  it('should update rules when rules gets updated', () => {
    let fieldsRef: any;
    const Component = ({ required = true }: { required?: boolean }) => {
      const { control } = useForm();
      fieldsRef = control._fields;
      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          rules={{ required }}
          control={control}
        />
      );
    };
    const { rerender } = render(<Component />);

    rerender(<Component required={false} />);

    expect(fieldsRef.test.required).toBeFalsy();
  });

  it('should set initial state from unmount state', () => {
    const Component = ({ isHide }: { isHide?: boolean }) => {
      const { control } = useForm();
      return isHide ? null : (
        <Controller
          defaultValue=""
          name="test"
          render={({ field }) => <input {...field} />}
          control={control}
        />
      );
    };

    const { rerender } = render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } });

    rerender(<Component isHide />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    rerender(<Component />);

    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('should skip validation when Controller is unmounted', async () => {
    const onValid = jest.fn();
    const onInvalid = jest.fn();

    const App = () => {
      const [show, setShow] = React.useState(true);
      const { control, handleSubmit } = useForm();

      return (
        <form onSubmit={handleSubmit(onValid, onInvalid)}>
          {show && (
            <Controller
              render={({ field }) => <input {...field} />}
              name={'test'}
              rules={{
                required: true,
              }}
              control={control}
            />
          )}
          <button type={'button'} onClick={() => setShow(false)}>
            toggle
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(onValid).toBeCalledTimes(0);
    expect(onInvalid).toBeCalledTimes(1);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    expect(onInvalid).toBeCalledTimes(1);
    expect(onValid).toBeCalledTimes(1);
  });

  it('should not set initial state from unmount state when input is part of field array', () => {
    const Component = () => {
      const { control } = useForm<{
        test: { value: string }[];
      }>();
      const { fields, append, remove } = useFieldArray({
        name: 'test',
        control,
      });

      return (
        <form>
          {fields.map((field, i) => (
            <Controller
              key={field.id}
              defaultValue={field.value}
              name={`test.${i}.value` as const}
              render={({ field }) => <input {...field} />}
              control={control}
            />
          ))}
          <button type="button" onClick={() => append({ value: 'test' })}>
            append
          </button>
          <button type="button" onClick={() => remove(0)}>
            remove
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } });

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('should not assign default value when field is removed with useFieldArray', () => {
    const Component = () => {
      const { control } = useForm();
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form>
          {fields.map((field, i) => (
            <div key={field.id}>
              <Controller
                render={({ field }) => <input {...field} />}
                name={`test.${i}.value`}
                defaultValue={''}
                control={control}
              />
              <button type="button" onClick={() => remove(i)}>
                remove{i}
              </button>
            </div>
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], {
      target: { value: '1' },
    });

    fireEvent.input(inputs[1], {
      target: { value: '2' },
    });

    fireEvent.input(inputs[2], {
      target: { value: '3' },
    });

    fireEvent.click(screen.getByRole('button', { name: /remove1/i }));

    expect(screen.getAllByRole('textbox')[0]).toHaveValue('1');
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('3');
  });

  it('should validate input when input is touched and with onTouched mode', async () => {
    let currentErrors: any = {};
    const Component = () => {
      const {
        formState: { errors },
        control,
      } = useForm<{ test: string }>({
        mode: 'onTouched',
      });

      currentErrors = errors;

      return (
        <form>
          <Controller
            name={'test'}
            control={control}
            defaultValue=""
            rules={{ required: true }}
            render={({ field }) => <input {...field} />}
          />
        </form>
      );
    };

    render(<Component />);

    const input = screen.getByRole('textbox');

    await act(async () => {
      fireEvent.blur(input);
    });

    expect(currentErrors.test).not.toBeUndefined();

    await act(async () => {
      fireEvent.input(input, {
        target: { value: '1' },
      });
    });

    expect(currentErrors.test).toBeUndefined();
  });

  it('should show invalid input when there is an error', async () => {
    const Component = () => {
      const { control } = useForm({
        mode: 'onChange',
      });

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field: props, fieldState }) => (
            <>
              <input {...props} />
              {fieldState.invalid && <p>Input is invalid.</p>}
            </>
          )}
          control={control}
          rules={{
            required: true,
          }}
        />
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    expect(screen.queryByText('Input is invalid.')).toBeNull();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '',
      },
    });

    await waitFor(async () => screen.queryByText('Input is invalid.'));
  });

  it('should show input has been touched.', async () => {
    const Component = () => {
      const { control } = useForm();

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field: props, fieldState }) => (
            <>
              <input {...props} />
              {fieldState.isTouched && <p>Input is touched.</p>}
            </>
          )}
          control={control}
          rules={{
            required: true,
          }}
        />
      );
    };

    render(<Component />);

    expect(screen.queryByText('Input is touched.')).toBeNull();

    fireEvent.blur(screen.getByRole('textbox'));

    await waitFor(async () => screen.queryByText('Input is touched.'));
  });

  it('should show input is dirty.', async () => {
    const Component = () => {
      const { control } = useForm();

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field: props, fieldState }) => (
            <>
              <input {...props} />
              {fieldState.isTouched && <p>Input is dirty.</p>}
            </>
          )}
          control={control}
          rules={{
            required: true,
          }}
        />
      );
    };

    render(<Component />);

    expect(screen.queryByText('Input is dirty.')).toBeNull();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    await waitFor(async () => screen.queryByText('Input is dirty.'));
  });

  it('should display input error.', async () => {
    const Component = () => {
      const { control } = useForm({
        mode: 'onChange',
      });

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field: props, fieldState }) => (
            <>
              <input {...props} />
              {fieldState.error && <p>{fieldState.error.message}</p>}
            </>
          )}
          control={control}
          rules={{
            required: 'This is required',
          }}
        />
      );
    };

    render(<Component />);

    fireEvent.blur(screen.getByRole('textbox'));

    await waitFor(async () => screen.queryByText('This is required'));
  });

  it('should not trigger extra-render while not subscribed to any input state', () => {
    let count = 0;

    const Component = () => {
      const { control } = useForm();
      count++;

      return (
        <Controller
          defaultValue=""
          name="test"
          render={({ field: props, fieldState }) => (
            <>
              <input {...props} />
              {fieldState.isTouched && <p>Input is dirty.</p>}
            </>
          )}
          control={control}
          rules={{
            required: true,
          }}
        />
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    expect(count).toEqual(1);
  });

  it('should update Controller value with setValue', () => {
    const Component = () => {
      const { control, setValue } = useForm<{
        test: string;
      }>();

      React.useEffect(() => {
        setValue('test', 'data');
      }, [setValue]);

      return (
        <Controller
          name={'test'}
          control={control}
          render={({ field }) => <input {...field} />}
          defaultValue=""
        />
      );
    };

    render(<Component />);

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'data',
    );
  });

  it('should retain default value or defaultValues at Controller', () => {
    let getValuesMethod = () => {};
    const Component = () => {
      const { control, getValues } = useForm<{
        test: number;
        test1: number;
      }>({
        defaultValues: {
          test: 2,
        },
      });

      getValuesMethod = getValues;

      return (
        <>
          <Controller
            render={({ field }) => <input {...field} />}
            name={'test'}
            control={control}
          />
          <Controller
            render={({ field }) => <input {...field} />}
            name={'test1'}
            defaultValue={1}
            control={control}
          />
        </>
      );
    };

    render(<Component />);

    expect(getValuesMethod()).toEqual({
      test: 2,
      test1: 1,
    });
  });

  it('should return correct isValid formState when input ref is not registered', async () => {
    const Component = () => {
      const {
        control,
        formState: { isValid },
      } = useForm<{
        test: string;
        test1: string;
      }>({
        mode: 'onChange',
        defaultValues: {
          test: '2',
          test1: '2',
        },
      });

      return (
        <>
          <Controller
            render={({ field }) => (
              <input value={field.value} onChange={field.onChange} />
            )}
            rules={{ required: true }}
            name={'test'}
            control={control}
          />
          <Controller
            render={({ field }) => (
              <input value={field.value} onChange={field.onChange} />
            )}
            rules={{ required: true }}
            name={'test1'}
            control={control}
          />
          {isValid ? 'true' : 'false'}
        </>
      );
    };

    render(<Component />);

    screen.getByText('false');

    act(() => {
      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: {
          value: '',
        },
      });
    });

    await waitFor(() => screen.getByText('false'));

    act(() => {
      fireEvent.input(screen.getAllByRole('textbox')[0], {
        target: {
          value: 'test',
        },
      });
    });

    await waitFor(() => screen.getByText('true'));
  });

  it('should subscribe the correct dirty fields', () => {
    type FormValues = {
      test: string;
    };

    const Component = () => {
      const {
        control,
        formState: { dirtyFields, isDirty },
      } = useForm<FormValues>({
        defaultValues: {
          test: '',
        },
      });

      return (
        <>
          <Controller
            control={control}
            name={'test'}
            render={({ field }) => <input {...field} />}
          />
          <p>{JSON.stringify(dirtyFields)}</p>
          <p>{isDirty ? 'true' : 'false'}</p>
        </>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: '1' } });
    });

    screen.getByText('{"test":true}');
    screen.getByText('true');

    act(() => {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    });

    screen.getByText('{}');
    screen.getByText('false');
  });

  it('should remove input value and reference with Controller and set shouldUnregister: true', () => {
    type FormValue = {
      test: string;
    };
    const watchedValue: FormValue[] = [];
    const Component = () => {
      const { control, watch } = useForm<FormValue>({
        defaultValues: {
          test: 'bill',
        },
      });
      const [show, setShow] = React.useState(true);
      watchedValue.push(watch());

      return (
        <>
          {show && (
            <Controller
              control={control}
              name={'test'}
              shouldUnregister
              render={({ field }) => <input {...field} />}
            />
          )}
          <button onClick={() => setShow(false)}>hide</button>
        </>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    expect(watchedValue).toMatchSnapshot();
  });

  it('should set ref to empty object when ref is not defined', async () => {
    const App = () => {
      const [show, setShow] = React.useState(false);
      const { control } = useForm({
        mode: 'onChange',
        defaultValues: {
          test: {
            firstName: '',
            lastName: '',
          },
        },
      });

      return (
        <div>
          {show && (
            <Controller
              name={'test'}
              rules={{ required: true }}
              control={control}
              render={({ field }) => (
                <input value={field.value as any} onChange={field.onChange} />
              )}
            />
          )}
          <button onClick={() => setShow(!show)}>setShow</button>
        </div>
      );
    };

    render(<App />);

    act(() => {
      fireEvent.click(screen.getByRole('button'));
    });

    await act(async () => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'test' },
      });
    });
  });

  it('should transform input value instead update via ref', () => {
    type FormValues = {
      test: number;
    };

    const transform = {
      input: (x: number) => x / 10,
    };

    function App() {
      const { control } = useForm<FormValues>({
        defaultValues: {
          test: 7200,
        },
      });

      return (
        <Controller
          name="test"
          control={control}
          render={({ field }) => (
            <input
              type="number"
              {...field}
              value={transform.input(+field.value)}
              placeholder="test"
            />
          )}
        />
      );
    }

    render(<App />);

    expect(
      (screen.getByPlaceholderText('test') as HTMLInputElement).value,
    ).toEqual('720');
  });

  it('should mark mounted inputs correctly within field array', async () => {
    const App = () => {
      const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: {
          test: [{ firstName: 'test' }],
        },
      });
      const { fields, prepend } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          {fields.map((field, index) => {
            return (
              <div key={field.id}>
                <Controller
                  control={control}
                  render={({ field }) => <input {...field} />}
                  name={`test.${index}.firstName`}
                  rules={{ required: true }}
                />
                {errors?.test?.[index]?.firstName && <p>error</p>}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() =>
              prepend({
                firstName: '',
              })
            }
          >
            prepend
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'prepend' }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'submit' }));
    });

    screen.getByText('error');
  });

  it('should not throw type error with field state', () => {
    type FormValues = {
      firstName: string;
      deepNested: {
        test: string;
      };
      todos: string[];
      nestedValue: NestedValue<{ test: string }>;
    };

    function App() {
      const { control } = useForm<FormValues>({
        defaultValues: {
          firstName: '',
          deepNested: { test: '' },
          todos: [],
          nestedValue: { test: '' },
        },
      });

      return (
        <form>
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="firstName"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="deepNested.test"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="todos"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...{ ...field, value: field.value.test }} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="nestedValue"
          />
        </form>
      );
    }

    render(<App />);

    expect(screen.getAllByRole('textbox').length).toEqual(4);
  });

  it('should not cause type error with any', () => {
    function App() {
      const { control } = useForm<any>({
        defaultValues: {
          firstName: '',
          deepNested: { test: '' },
          todos: [],
          nestedValue: { test: '' },
        },
      });

      return (
        <form>
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="firstName"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="deepNested.test"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="todos"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...{ ...field, value: field.value.test }} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="nestedValue"
          />
        </form>
      );
    }

    render(<App />);

    expect(screen.getAllByRole('textbox').length).toEqual(4);
  });

  it('should not cause type error without generic type', () => {
    function App() {
      const { control } = useForm({
        defaultValues: {
          firstName: '',
          deepNested: { test: '' },
          todos: [],
          nestedValue: { test: '' },
        },
      });

      return (
        <form>
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="firstName"
          />
          <Controller
            render={({ field, fieldState }) => (
              <>
                <input {...field} />
                <p>{fieldState.error?.message}</p>
              </>
            )}
            control={control}
            name="deepNested.test"
          />
          <Controller
            render={({ field }) => (
              <>
                <input {...field} />
              </>
            )}
            control={control}
            name="todos"
          />
          <Controller
            render={({ field }) => (
              <>
                <input {...{ ...field, value: field.value.test }} />
              </>
            )}
            control={control}
            name="nestedValue"
          />
        </form>
      );
    }

    render(<App />);

    expect(screen.getAllByRole('textbox').length).toEqual(4);
  });
});
