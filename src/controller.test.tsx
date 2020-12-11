import * as React from 'react';
import {
  render,
  waitFor,
  fireEvent,
  act,
  screen,
} from '@testing-library/react';
import { Controller } from './controller';
import { FormProvider } from './useFormContext';
import { useFieldArray } from './useFieldArray';
import { useForm } from './useForm';

const Input = ({ onChange, onBlur, placeholder }: any) => (
  <input
    placeholder={placeholder}
    onChange={() => onChange?.(1, 2)}
    onBlur={() => onBlur?.(1, 2)}
  />
);

describe('Controller', () => {
  it('should render correctly with as with string', () => {
    const Component = () => {
      const { control } = useForm();
      return (
        <Controller
          defaultValue=""
          name="test"
          as={'input' as const}
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
          as={<input />}
          control={control}
        />
      );
    };

    render(<Component />);

    const input = screen.queryByRole('textbox') as HTMLInputElement | null;

    expect(input).toBeInTheDocument();
    expect(input?.name).toBe('test');
  });

  it('should be assigned method.control variable if wrap with FormProvider', () => {
    const Component = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <Controller defaultValue="" name="test" as={'input' as const} />
        </FormProvider>
      );
    };

    expect(() => render(<Component />)).not.toThrow();
  });

  it('should reset value', async () => {
    const Component = () => {
      const { reset, control } = useForm();

      return (
        <>
          <Controller
            defaultValue="default"
            name="test"
            as={<input />}
            control={control}
          />
          <button type="button" onClick={() => reset()}>
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
          as={<input />}
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
          as={<input />}
          control={control}
        />
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), { target: { value: 'test' } });

    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it("should trigger component's onChange method and invoke setValue method", () => {
    let fieldValues: any;
    const Component = () => {
      const { control, getValues } = useForm();

      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            as={<input />}
            control={control}
          />
          {/**
           * We are checking if setValue method is invoked
           */}
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

      errors = rest.errors;

      return (
        <Controller
          defaultValue="test"
          name="test"
          as={<input />}
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

      errors = rest.errors;

      return (
        <Controller
          defaultValue=""
          name="test"
          as={<input />}
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

  it('should set field to formState.touched', async () => {
    let touched: any;
    const Component = () => {
      const { control, formState } = useForm({ mode: 'onBlur' });

      touched = formState.touched;

      return (
        <Controller
          defaultValue=""
          name="test"
          as={<input />}
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

  it('should call trigger method when revalidationMode is onBlur with blur event', async () => {
    const Component = () => {
      const { handleSubmit, control, errors } = useForm({
        reValidateMode: 'onBlur',
      });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <Controller
            defaultValue=""
            name="test"
            as={<input />}
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
            render={(props) => {
              return <input {...props} />;
            }}
            control={control}
          />
          {/**
           * We are checking if setValue method is invoked
           */}
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
      const { control } = useForm();
      return (
        <>
          <Controller
            defaultValue=""
            name="test"
            render={({ onBlur, value }) => {
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
            render={({ onChange, value }) => {
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

  it('should be null if as and render props are not given', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    const Component = () => {
      const { control } = useForm();
      // @ts-ignore
      return <Controller defaultValue="" name="test" control={control} />;
    };

    const { container } = render(<Component />);

    expect(container).toEqual(document.createElement('div'));

    // @ts-ignore
    console.warn.mockRestore();
  });

  it('should update rules when rules gets updated', () => {
    let fieldsRef: any;
    const Component = ({ required = true }: { required?: boolean }) => {
      const { control } = useForm();
      fieldsRef = control.fieldsRef;
      return (
        <Controller
          defaultValue=""
          name="test"
          as={<input />}
          rules={{ required }}
          control={control}
        />
      );
    };
    const { rerender } = render(<Component />);

    rerender(<Component required={false} />);

    expect(fieldsRef.current.test.required).toBeFalsy();
  });

  it('should set initial state from unmount state', () => {
    const Component = ({ isHide }: { isHide?: boolean }) => {
      const { control } = useForm({ shouldUnregister: false });
      return isHide ? null : (
        <Controller
          defaultValue=""
          name="test"
          as={<input />}
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

  it('should not set initial state from unmount state when input is part of field array', () => {
    const Component = () => {
      const { control } = useForm({ shouldUnregister: false });
      const { fields, append, remove } = useFieldArray({
        name: 'test',
        control,
      });

      return (
        <form>
          {fields.map((field, i) => (
            <Controller
              key={field.id}
              defaultValue=""
              name={`test[${i}].value`}
              as={<input />}
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

    expect(screen.getByRole('textbox')).not.toHaveValue();
  });

  describe('error handling', () => {
    it('should throw custom error if control is undefined in development environment', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const Component = () => {
        return <Controller as={'input' as const} name="test" defaultValue="" />;
      };

      expect(() => render(<Component />)).toThrow(
        '📋 Controller is missing `control` prop.',
      );

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.error.mockRestore();
    });

    it('should throw TypeError if control is undefined in production environment', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        return <Controller as={'input' as const} name="test" defaultValue="" />;
      };

      expect(() => render(<Component />)).toThrow(
        "Cannot read property 'control' of null",
      );

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.error.mockRestore();
    });

    it('should output error message if name is empty string in development environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const Component = () => {
        const { control } = useForm();
        return (
          <Controller
            as={'input' as const}
            name=""
            control={control}
            defaultValue=""
          />
        );
      };

      render(<Component />);

      expect(console.warn).toBeCalledTimes(2);

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should not output error message if name is empty string in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { control } = useForm();
        return (
          <Controller
            as={'input' as const}
            name=""
            control={control}
            defaultValue=""
          />
        );
      };

      render(<Component />);

      expect(console.warn).not.toBeCalled();

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should output error message if defaultValue is undefined in development environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const Component = () => {
        const { control } = useForm();
        return (
          <Controller as={'input' as const} name="test" control={control} />
        );
      };

      render(<Component />);

      expect(console.warn).toBeCalledTimes(1);

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should not output error message if defaultValue is undefined in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { control } = useForm();
        return (
          <Controller as={'input' as const} name="test" control={control} />
        );
      };

      render(<Component />);

      expect(console.warn).not.toBeCalled();

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should not output error message if as and render props are given in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { control } = useForm();
        return (
          // @ts-ignore
          <Controller
            as={'input' as const}
            render={() => <input />}
            defaultValue=""
            name="test"
            control={control}
          />
        );
      };

      render(<Component />);

      expect(console.warn).not.toBeCalled();

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should not output error message if as and render props are not given in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { control } = useForm();
        return (
          // @ts-ignore
          <Controller defaultValue="" name="test" control={control} />
        );
      };

      render(<Component />);

      expect(console.warn).not.toBeCalled();

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should warn the user when defaultValue is missing with useFieldArray in development environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const Component = () => {
        const { control } = useForm({
          defaultValues: {
            test: [{ data: '' }],
          },
        });
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map(({ id }, index) => {
              return (
                <Controller
                  name={`test[${index}].data`}
                  as={'input' as const}
                  control={control}
                  key={id}
                />
              );
            })}
          </form>
        );
      };

      render(<Component />);

      expect(console.warn).toBeCalledTimes(1);

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });

    it('should not warn the user when defaultValue is missing with useFieldArray in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { control } = useForm({
          defaultValues: {
            test: [{ data: '' }],
          },
        });
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map(({ id }, index) => {
              return (
                // @ts-ignore
                <Controller
                  name={`test[${index}].data`}
                  control={control}
                  key={id}
                />
              );
            })}
          </form>
        );
      };

      render(<Component />);

      expect(console.warn).not.toBeCalled();

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
    });
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
                as="input"
                name={`test[${i}].value`}
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
      const { errors, control } = useForm<{ test: string }>({
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
            render={(props) => <input {...props} />}
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

  it('does not trigger rerender for memoized inputs', () => {
    let renderCount = 0;

    const MemoizedInput = React.memo(
      React.forwardRef((_props: any, _ref) => {
        renderCount++;
        return null;
      }),
    );

    const Component = () => {
      const { control } = useForm();
      return (
        <Controller
          defaultValue=""
          name="test"
          render={(props) => <MemoizedInput {...props} />}
          control={control}
        />
      );
    };

    const { rerender } = render(<Component />);

    expect(renderCount).toEqual(1);

    rerender(<Component />);

    expect(renderCount).toEqual(1);
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
          render={(props, meta) => (
            <>
              <input {...props} />
              {meta.invalid && <p>Input is invalid.</p>}
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
          render={(props, meta) => (
            <>
              <input {...props} />
              {meta.isTouched && <p>Input is touched.</p>}
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
          render={(props, meta) => (
            <>
              <input {...props} />
              {meta.isTouched && <p>Input is dirty.</p>}
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

  it('should not trigger extra-render while not subscribed to any input state', () => {
    let count = 0;

    const Component = () => {
      const { control } = useForm();
      count++;

      return (
        <Controller
          defaultValue=""
          name="test"
          render={(props, meta) => (
            <>
              <input {...props} />
              {meta.isTouched && <p>Input is dirty.</p>}
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
});
