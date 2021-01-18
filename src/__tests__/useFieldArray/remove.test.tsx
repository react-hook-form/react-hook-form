import { useForm } from '../../useForm';
import { useFieldArray } from '../../useFieldArray';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { VALIDATION_MODE } from '../../constants';
import { Control, DeepMap, FieldError, UseFormMethods } from '../../types';
import * as React from 'react';
import { Controller } from '../../controller';
import { mockGenerateId } from '../useFieldArray.test';

let nodeEnv: string | undefined;

describe('remove', () => {
  beforeEach(() => {
    mockGenerateId();
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    process.env.NODE_ENV = nodeEnv;
  });

  it('should update isDirty formState when item removed', () => {
    let formState: any;
    const Component = () => {
      const { register, control, formState: tempFormState } = useForm({
        defaultValues: {
          test: [{ name: 'default' }],
        },
      });
      const { fields, remove, append } = useFieldArray({
        name: 'test',
        control,
      });

      formState = tempFormState;
      formState.isDirty;

      return (
        <form>
          {fields.map((field, i) => (
            <div key={i.toString()}>
              <input
                {...register(`test.${i}.name` as const)}
                defaultValue={field.name}
              />
              <button type={'button'} onClick={() => remove(i)}>
                remove
              </button>
            </div>
          ))}

          <button
            type={'button'}
            onClick={() =>
              append({
                name: '',
              })
            }
          >
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    expect(formState.isDirty).toBeFalsy();

    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    expect(formState.isDirty).toBeTruthy();

    fireEvent.click(screen.getAllByRole('button', { name: /remove/i })[1]);

    expect(formState.isDirty).toBeFalsy();
  });

  it('should update isValid formState when item removed', async () => {
    let formState: any;
    const Component = () => {
      const { register, control, formState: tempFormState } = useForm({
        mode: 'onChange',
        defaultValues: {
          test: [{ name: 'default' }],
        },
      });
      const { fields, remove, append } = useFieldArray({
        name: 'test',
        control,
      });

      formState = tempFormState;

      formState.isValid;

      return (
        <form>
          {fields.map((field, i) => (
            <div key={i.toString()}>
              <input
                {...register(`test.${i}.name` as const, { required: true })}
                defaultValue={field.name}
              />
              <button type={'button'} onClick={() => remove(i)}>
                remove
              </button>
            </div>
          ))}

          <button
            type={'button'}
            onClick={() =>
              append({
                name: '',
              })
            }
          >
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    expect(formState.isValid).toBeFalsy();

    await actComponent(async () => {
      await fireEvent.click(
        screen.getAllByRole('button', { name: /remove/i })[1],
      );
    });

    expect(formState.isValid).toBeTruthy();
  });

  it('should remove field according index', () => {
    const { result } = renderHook(() => {
      const { control } = useForm({
        defaultValues: {
          test: [{ value: 'default' }],
        },
      });
      return useFieldArray({
        control,
        name: 'test',
      });
    });

    act(() => {
      result.current.append({ value: 'test' });
    });

    act(() => {
      result.current.remove(1);
    });

    expect(result.current.fields).toEqual([{ id: '0', value: 'default' }]);

    act(() => {
      result.current.remove(0);
    });

    expect(result.current.fields).toEqual([]);
  });

  it('should remove all field', () => {
    const { result } = renderHook(() => {
      const { control } = useForm({
        defaultValues: {
          test: [{ value: 'default' }],
        },
      });
      return useFieldArray({
        control,
        name: 'test',
      });
    });

    act(() => {
      result.current.append({ value: 'test' });
    });

    act(() => {
      result.current.remove();
    });

    expect(result.current.fields).toEqual([]);
  });

  it('should remove specific fields when index is array', () => {
    const { result } = renderHook(() => {
      const { control } = useForm({
        defaultValues: {
          test: [{ value: 'default' }],
        },
      });
      return useFieldArray({
        control,
        name: 'test',
      });
    });

    act(() => {
      result.current.append({ value: 'test' });
    });

    act(() => {
      result.current.remove([0, 1]);
    });

    expect(result.current.fields).toEqual([]);
  });

  it.each(['isDirty', 'dirtyFields'])(
    'should be dirtyFields when value is remove with %s',
    () => {
      const { result } = renderHook(() => {
        const { register, formState, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
        });
        const { fields, append, remove } = useFieldArray({
          control,
          name: 'test',
        });

        return { register, formState, fields, append, remove };
      });

      result.current.formState.isDirty;
      result.current.formState.dirtyFields;

      act(() => {
        result.current.append({ value: 'test' });
      });

      act(() => {
        result.current.append({ value: 'test' });
      });

      act(() => {
        result.current.remove(0);
      });

      expect(result.current.formState.isDirty).toBeTruthy();
      expect(result.current.formState.dirtyFields).toEqual({
        test: [{ value: true }, { value: true }],
      });

      act(() => {
        result.current.remove();
      });

      expect(result.current.formState.isDirty).toBeTruthy();
      expect(result.current.formState.dirtyFields).toEqual({
        test: [{ value: true }],
      });
    },
  );

  it('should remove values from formState.touchedFields', () => {
    let touched: any;

    const Component = () => {
      const { register, formState, control } = useForm();
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });

      touched = formState.touchedFields;

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value`)} />
          ))}
          <button type="button" onClick={() => append({ value: 'append' })}>
            append
          </button>
          <button type="button" onClick={() => remove(0)}>
            remove
          </button>
          <button type="button" onClick={() => remove()}>
            remove all
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    const inputs = screen.getAllByRole('textbox');

    fireEvent.blur(inputs[0]);
    fireEvent.blur(inputs[1]);
    fireEvent.blur(inputs[2]);

    expect(touched).toEqual({
      test: [{ value: true }, { value: true }, { value: true }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    expect(touched).toEqual({
      test: [{ value: true }, { value: true }],
    });

    fireEvent.click(screen.getByRole('button', { name: 'remove all' }));

    expect(touched).toEqual({});
  });

  it('should remove specific field if isValid is true', async () => {
    let isValid: any;
    const Component = () => {
      const { register, formState, control } = useForm({
        mode: VALIDATION_MODE.onChange,
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });
      isValid = formState.isValid;

      return (
        <form>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.value` as const, { required: true })}
            />
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
          <button type="button" onClick={() => remove(1)}>
            remove
          </button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    expect(isValid).toBeFalsy();

    const inputs = screen.getAllByRole('textbox');

    await actComponent(async () => {
      fireEvent.input(inputs[0], {
        target: { value: 'test' },
      });
    });

    await actComponent(async () => {
      fireEvent.input(inputs[2], {
        target: { value: 'test' },
      });
    });

    await actComponent(async () => {
      fireEvent.input(inputs[3], {
        target: { value: 'test' },
      });
    });

    expect(isValid).toBeFalsy();

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    });

    expect(isValid).toBeTruthy();
  });

  it('should remove all field if isValid is true', async () => {
    let isValid: any;
    const Component = () => {
      const { register, formState, control } = useForm({
        mode: VALIDATION_MODE.onChange,
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });
      isValid = formState.isValid;

      return (
        <form>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.value` as const, { required: true })}
            />
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
          <button type="button" onClick={() => remove()}>
            remove
          </button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
    });

    expect(isValid).toBeFalsy();

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    });

    expect(isValid).toBeTruthy();
  });

  it('should remove error', async () => {
    let errors: any;
    const Component = () => {
      const {
        register,
        formState: { errors: tempErrors },
        handleSubmit,
        control,
      } = useForm();
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });
      errors = tempErrors;

      return (
        <form onSubmit={handleSubmit(() => {})}>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.value` as const, { required: true })}
            />
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
          <button type="button" onClick={() => remove(0)}>
            remove
          </button>
          <button type="button" onClick={() => remove()}>
            remove all
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    expect(errors.test).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'remove all' }));

    expect(errors.test).toBeUndefined();
  });

  it('should remove nested field array error', async () => {
    type FormValues = {
      test: {
        nested: {
          test: string;
          key: number;
        }[];
      }[];
    };

    let mockKey = 0;
    const Nested = ({
      register,
      errors,
      control,
      index,
    }: {
      register: UseFormMethods['register'];
      control: Control<FormValues>;
      errors: DeepMap<Record<string, any>, FieldError>;
      index: number;
    }) => {
      const { fields, append, remove } = useFieldArray({
        name: `test.${index}.nested` as any,
        control,
      });
      return (
        <fieldset>
          {fields.map((field, i) => (
            <div key={field.id}>
              <input
                {...register(`test.${index}.nested.${i}.test`, {
                  required: 'required',
                })}
              />
              {errors?.test &&
                errors.test[index]?.nested &&
                errors.test[index].nested[i]?.test && (
                  <span data-testid="nested-error">
                    {errors.test[index].nested[i].test.message}
                  </span>
                )}
              <button onClick={() => remove(i)}>nested delete</button>
            </div>
          ))}
          <button onClick={() => append({ test: 'test', key: mockKey++ })}>
            nested append
          </button>
        </fieldset>
      );
    };
    const callback = jest.fn();
    const Component = () => {
      const {
        register,
        formState: { errors },
        handleSubmit,
        control,
      } = useForm<FormValues>({
        defaultValues: {
          test: [{ nested: [{ test: '', key: mockKey }] }],
        },
      });
      const { fields } = useFieldArray({ name: 'test', control });
      return (
        <form onSubmit={handleSubmit(callback)}>
          {fields.map((_, i) => (
            <Nested
              key={i.toString()}
              // @ts-ignore
              register={register}
              errors={errors}
              control={control}
              index={i}
            />
          ))}
          <button>submit</button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      await fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    expect(screen.queryByTestId('nested-error')).toBeInTheDocument();

    await actComponent(async () => {
      await fireEvent.click(
        screen.getByRole('button', { name: /nested delete/i }),
      );
    });

    expect(screen.queryByTestId('nested-error')).not.toBeInTheDocument();

    await actComponent(async () => {
      await fireEvent.click(
        screen.getByRole('button', { name: /nested append/i }),
      );
    });

    expect(screen.queryByTestId('nested-error')).not.toBeInTheDocument();
  });

  it('should trigger reRender when user is watching the all field array', () => {
    const watched: any[] = [];
    const Component = () => {
      const { register, watch, control } = useForm<{
        test: {
          value: string;
        }[];
      }>();
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });
      watched.push(watch());

      return (
        <form>
          {fields.map((field, i) => (
            <input
              key={field.id}
              defaultValue={field.value}
              {...register(`test.${i}.value` as const)}
            />
          ))}
          <button type="button" onClick={() => append({ value: '' })}>
            append
          </button>
          <button type="button" onClick={() => remove(0)}>
            remove
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    fireEvent.click(screen.getByRole('button', { name: 'remove' }));

    expect(watched).toEqual([
      {}, // first render
      {}, // render inside useEffect in useFieldArray
      { test: [{ value: '' }] }, // render inside append method
      { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
      { test: [] }, // render inside remove method
      {}, // render inside useEffect in useFieldArray
    ]);
  });

  it('should return watched value with watch API', async () => {
    const renderedItems: any = [];
    const Component = () => {
      const { watch, register, control } = useForm<{
        test: {
          value: string;
        }[];
      }>();
      const { fields, append, remove } = useFieldArray({
        name: 'test',
        control,
      });
      const watched = watch('test');
      const isRemoved = React.useRef(false);
      if (isRemoved.current) {
        renderedItems.push(watched);
      }

      return (
        <div>
          {fields.map((field, i) => (
            <div key={`${field.id}`}>
              <input
                {...register(`test.${i}.value` as const)}
                defaultValue={field.value}
              />
            </div>
          ))}
          <button onClick={() => append({ value: '' })}>append</button>
          <button
            onClick={() => {
              remove(2);
              isRemoved.current = true;
            }}
          >
            remove
          </button>
        </div>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], {
      target: { name: 'test[0].value', value: '111' },
    });
    fireEvent.change(inputs[1], {
      target: { name: 'test[1].value', value: '222' },
    });
    fireEvent.change(inputs[2], {
      target: { name: 'test[2].value', value: '333' },
    });

    fireEvent.click(screen.getByRole('button', { name: /remove/i }));

    await waitFor(() =>
      expect(renderedItems).toEqual([
        [{ value: '111' }, { value: '222' }],
        [{ value: '111' }, { value: '222' }],
      ]),
    );
  });

  it('should remove dirtyFields fields with nested field inputs', () => {
    const { result } = renderHook(() => {
      const { register, formState, control } = useForm({
        defaultValues: {
          test: {
            data: [{ value: 'default' }],
          },
        },
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test.data',
      });

      return { register, formState, fields, append, remove };
    });

    result.current.formState.dirtyFields as Record<string, any>;
    result.current.formState.isDirty;

    act(() => {
      result.current.append({ value: 'test' });
    });

    expect(result.current.formState.isDirty).toBeTruthy();
    expect(result.current.formState.dirtyFields).toEqual({
      test: { data: [undefined, { value: true }] },
    });

    act(() => {
      result.current.remove(1);
    });

    expect(result.current.formState.isDirty).toBeFalsy();
    expect(result.current.formState.dirtyFields).toEqual({});
  });

  it('should remove Controller by index without error', () => {
    const Component = () => {
      const { control, handleSubmit } = useForm<{
        test: {
          firstName: string;
        }[];
      }>({
        defaultValues: {
          test: [],
        },
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <ul>
            {fields.map((item, index) => {
              return (
                <li key={item.id}>
                  <Controller
                    render={({ field }) => <input {...field} />}
                    name={`test.${index}.firstName` as const}
                    control={control}
                    defaultValue={item.firstName}
                  />
                  <button type="button" onClick={() => remove(index)}>
                    delete
                  </button>
                </li>
              );
            })}
          </ul>
          <section>
            <button
              type="button"
              onClick={() => {
                append({ firstName: 'appendBill' });
              }}
            >
              append
            </button>
          </section>

          <input type="submit" />
        </form>
      );
    };

    render(<Component />);

    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'append' }));
    });
    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'append' }));
    });
    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'append' }));
    });
    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'append' }));
    });

    actComponent(() => {
      fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[1]);
    });
    actComponent(() => {
      fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[1]);
    });
    actComponent(() => {
      fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[1]);
    });
    actComponent(() => {
      fireEvent.click(screen.getAllByRole('button', { name: 'delete' })[0]);
    });
  });

  it("should not reset Controller's value during remove when Field Array name is already registered", () => {
    function Component() {
      const { control, handleSubmit } = useForm({
        defaultValues: {
          test: [{ firstName: 'Bill', lastName: '' }],
        },
      });
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <ul>
            {fields.map((item, index) => {
              return (
                <li key={item.id}>
                  <Controller
                    name={`test.${index}.lastName` as const}
                    control={control}
                    defaultValue={item.lastName} // make sure to set up defaultValue
                    render={(props: any) => <input {...props} />}
                  />
                  <button type="button" onClick={() => remove(index)}>
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => {
              append({ firstName: 'appendBill', lastName: 'appendLuo' });
            }}
          >
            append
          </button>
        </form>
      );
    }

    render(<Component />);

    fireEvent.input(screen.getAllByRole('textbox')[0], {
      target: { name: 'test[0].lastName', value: '111' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[1]);

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('111');
  });

  describe('with resolver', () => {
    it('should invoke resolver when formState.isValid true', async () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
          defaultValues: {
            test: [{ value: 'test' }],
          },
        });
        const { remove } = useFieldArray({ control, name: 'test' });
        return { formState, remove };
      });

      result.current.formState.isValid;

      await act(async () => {
        result.current.remove(0);
      });

      expect(resolver).toBeCalledWith(
        {
          test: [],
        },
        undefined,
        { criteriaMode: undefined },
      );
    });

    it('should not invoke resolver when formState.isValid false', () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
          defaultValues: {
            test: [{ value: 'test' }],
          },
        });
        const { remove } = useFieldArray({ control, name: 'test' });
        return { formState, remove };
      });

      act(() => {
        result.current.remove(0);
      });

      expect(resolver).not.toBeCalled();
    });
  });
});
