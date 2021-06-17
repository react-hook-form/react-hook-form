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
import { NestedValue, UseFormReturn } from '../../types';
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
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');

    result.current.formState.errors = {
      test: {
        type: 'test',
        message: 'something wrong',
      },
    };

    result.current.formState.touchedFields = { test: true };
    result.current.formState.isDirty = true;
    result.current.formState.isSubmitted = true;

    act(() =>
      result.current.reset(
        { test: '' },
        {
          keepErrors: true,
          keepDirty: true,
          keepIsSubmitted: true,
          keepTouched: true,
          keepIsValid: true,
          keepSubmitCount: true,
        },
      ),
    );

    expect(result.current.formState.errors).toEqual({
      test: {
        type: 'test',
        message: 'something wrong',
      },
    });
    expect(result.current.formState.touchedFields).toEqual({
      test: true,
    });
    expect(result.current.formState.isDirty).toBeTruthy();
    expect(result.current.formState.isSubmitted).toBeTruthy();
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
      }, []);

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
});
