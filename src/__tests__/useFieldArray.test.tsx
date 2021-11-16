import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { Controller } from '../controller';
import * as generateId from '../logic/generateId';
import {
  Control,
  FieldValues,
  SubmitHandler,
  UseFormRegister,
  UseFormReturn,
} from '../types';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import { FormProvider } from '../useFormContext';

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

describe('useFieldArray', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  describe('initialize', () => {
    it('should return default fields value', () => {
      const { result } = renderHook(() => {
        const { control } = useForm();
        return useFieldArray({
          control,
          name: 'test',
        });
      });

      expect(result.current.fields).toEqual([]);
    });

    it('should populate default values into fields', () => {
      const { result } = renderHook(() => {
        const { control } = useForm({
          defaultValues: { test: [{ test: '1' }, { test: '2' }] },
        });
        return useFieldArray({
          control,
          name: 'test',
        });
      });

      expect(result.current.fields).toEqual([
        { test: '1', id: '0' },
        { test: '2', id: '1' },
      ]);
    });

    it('should render with FormProvider', () => {
      const Provider: React.FC = ({ children }) => {
        const methods = useForm();
        return <FormProvider {...methods}>{children}</FormProvider>;
      };
      const { result } = renderHook(() => useFieldArray({ name: 'test' }), {
        wrapper: Provider,
      });
      expect(result.error).toBeUndefined();
    });
  });

  describe('with should unregister false', () => {
    it('should still remain input value with toggle', () => {
      const Component = () => {
        const { register, control } = useForm<{
          test: {
            value: string;
          }[];
        }>();
        const [show, setShow] = React.useState(true);
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {show &&
              fields.map((field, i) => (
                <input
                  key={field.id}
                  {...register(`test.${i}.value` as const)}
                />
              ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => setShow(!show)}>
              toggle
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'append' }));
      expect(screen.getAllByRole('textbox').length).toEqual(1);
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
      expect(screen.queryByRole('textbox')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
      expect(screen.getAllByRole('textbox').length).toEqual(1);
    });

    it('should show errors during mount when mode is set to onChange', async () => {
      const Component = () => {
        const {
          register,
          control,
          formState: { isValid, errors },
        } = useForm<{ test: { value: string }[] }>({
          defaultValues: {
            test: [{ value: 'test' }],
          },
          resolver: async () => ({
            values: {},
            errors: {
              test: [{ value: { message: 'wrong', type: 'test' } }],
            },
          }),
          mode: 'onChange',
        });
        const { fields, append } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button
              type="button"
              onClick={() =>
                append({
                  value: 'test',
                })
              }
            >
              append
            </button>

            {!isValid && <p>not valid</p>}
            {errors.test && <p>errors</p>}
          </form>
        );
      };

      render(<Component />);
      await waitFor(() => screen.getAllByRole('textbox'));
      await waitFor(() => screen.getByText('not valid'));
    });

    it('should retain input values during unmount', async () => {
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
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <div>
            {fields.map((item, index) => {
              return (
                <div key={item.id}>
                  <input {...register(`test.${index}.name`)} />
                </div>
              );
            })}
          </div>
        );
      };

      const App = () => {
        const [show, setShow] = React.useState(true);
        const { control, register } = useForm({
          shouldUnregister: false,
          defaultValues: {
            test: [{ name: 'test' }],
          },
        });

        return (
          <div>
            {show && <FieldArray control={control} register={register} />}
            <button type={'button'} onClick={() => setShow(!show)}>
              toggle
            </button>
          </div>
        );
      };

      render(<App />);

      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: '12345' },
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
        '12345',
      );
    });
  });

  describe('with resolver', () => {
    it('should provide updated form value each action', async () => {
      let formData = {};
      const Component = () => {
        const {
          register,
          control,
          formState: { isValid },
        } = useForm<{
          data: string;
          test: { value: string }[];
        }>({
          resolver: (data) => {
            formData = data;
            return {
              values: {},
              errors: {},
            };
          },
        });
        const { fields, append } = useFieldArray({ name: 'test', control });

        return (
          <div>
            <input {...register('data')} defaultValue="test" />
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <span>{isValid && 'valid'}</span>
          </div>
        );
      };

      render(<Component />);

      await waitFor(() => screen.getByText('valid'));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(formData).toEqual({
        data: 'test',
        test: [{ value: '' }],
      });
    });

    it('should provide correct form data with nested field array', async () => {
      type FormValues = {
        test: {
          value: string;
          nestedArray: {
            value: string;
          }[];
        }[];
      };

      let formData: any = {};
      const Nested = ({
        index,
        control,
      }: {
        control: Control<FormValues>;
        index: number;
      }) => {
        const { fields, append } = useFieldArray<FormValues>({
          name: `test.${index}.nestedArray` as const,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `test.${index}.nestedArray.${i}.value` as const,
                )}
              />
            ))}

            <button type={'button'} onClick={() => append({ value: 'test' })}>
              Append Nest
            </button>
          </div>
        );
      };

      const Component = () => {
        const {
          register,
          control,
          formState: { isValid },
        } = useForm<FormValues>({
          resolver: (data) => {
            formData = data;
            return {
              values: data,
              errors: {},
            };
          },
          mode: 'onChange',
          defaultValues: {
            test: [{ value: '1', nestedArray: [{ value: '2' }] }],
          },
        });
        const { fields, remove } = useFieldArray({
          name: 'test',
          control,
        });

        return (
          <form>
            {fields.map((item, i) => (
              <fieldset key={item.id}>
                <input {...register(`test.${i}.value` as const)} />

                <Nested control={control} index={i} />
                <button type={'button'} onClick={() => remove(i)}>
                  delete
                </button>
              </fieldset>
            ))}
            <span>{isValid && 'valid'}</span>
          </form>
        );
      };

      render(<Component />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Append Nest' }));
      });

      await waitFor(() => screen.getByText('valid'));

      expect(formData).toEqual({
        test: [
          {
            value: '1',
            nestedArray: [{ value: '2' }, { value: 'test' }],
          },
        ],
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'delete' }));
      });

      expect(formData).toEqual({
        test: [],
      });
    });

    it('should report field array error during user action', async () => {
      const App = () => {
        const {
          register,
          control,
          formState: { errors },
        } = useForm<{
          test: { value: string }[];
        }>({
          resolver: (data) => {
            return {
              values: data,
              errors: {
                test: {
                  type: 'test',
                  message: 'minLength',
                },
              },
            };
          },
          defaultValues: {
            test: [{ value: '1' }],
          },
        });
        const { fields, remove } = useFieldArray({
          name: 'test',
          control,
        });

        return (
          <form>
            {errors.test && <p>minLength</p>}

            {fields.map((item, i) => (
              <fieldset key={item.id}>
                <input {...register(`test.${i}.value` as const)} />
                <button type={'button'} onClick={() => remove(i)}>
                  delete
                </button>
              </fieldset>
            ))}
          </form>
        );
      };

      render(<App />);

      expect(screen.queryByText('minLength')).toBeNull();

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      await waitFor(async () => {
        screen.getByText('minLength');
      });
    });

    it('should not return schema error without user action', () => {
      const App = () => {
        const {
          register,
          control,
          formState: { errors },
        } = useForm<{
          test: { value: string }[];
        }>({
          resolver: (data) => {
            return {
              values: data,
              errors: {
                test: {
                  type: 'test',
                  message: 'minLength',
                },
              },
            };
          },
          defaultValues: {
            test: [],
          },
        });
        const { fields, remove } = useFieldArray({
          name: 'test',
          control,
        });

        return (
          <form>
            {errors.test && <p>minLength</p>}

            {fields.map((item, i) => (
              <fieldset key={item.id}>
                <input {...register(`test.${i}.value` as const)} />
                <button type={'button'} onClick={() => remove(i)}>
                  delete
                </button>
              </fieldset>
            ))}
          </form>
        );
      };

      render(<App />);

      expect(screen.queryByText('minLength')).toBeNull();
    });
  });

  describe('when component unMount', () => {
    it('should keep field array values', async () => {
      let getValues: any;
      const Component = () => {
        const [show, setShow] = React.useState(true);
        const { register, control, getValues: tempGetValues } = useForm();
        const { fields, append } = useFieldArray({ name: 'test', control });
        getValues = tempGetValues;

        return (
          <>
            {show && (
              <div>
                {fields.map((_, i) => (
                  <input key={i.toString()} {...register(`test.${i}.value`)} />
                ))}
                <button onClick={() => append({ value: '' })}>append</button>
              </div>
            )}
            <button type={'button'} onClick={() => setShow(!show)}>
              setShow
            </button>
          </>
        );
      };

      render(<Component />);

      const button = screen.getByRole('button', { name: /append/i });

      await actComponent(async () => {
        fireEvent.click(button);
      });

      await actComponent(async () => {
        fireEvent.click(button);
      });

      await actComponent(async () => {
        fireEvent.click(button);
      });

      fireEvent.click(screen.getByRole('button', { name: 'setShow' }));

      expect(getValues()).toEqual({
        test: [{ value: '' }, { value: '' }, { value: '' }],
      });

      fireEvent.click(screen.getByRole('button', { name: 'setShow' }));
      expect(screen.getAllByRole('textbox').length).toEqual(3);
    });

    it('should remove reset method when field array is removed', async () => {
      let controlTemp: any;
      let fieldsTemp: unknown[] = [];

      const App = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
        });
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        });
        controlTemp = control;
        fieldsTemp = fields;

        return (
          <form>
            {fields.map((field) => {
              return <input key={field.id} {...register('test.0.value')} />;
            })}
            <button
              type={'button'}
              onClick={() => {
                append({
                  value: 'test',
                });
              }}
            >
              append
            </button>
          </form>
        );
      };

      const { unmount } = render(<App />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      unmount();

      expect(fieldsTemp).toMatchSnapshot();
      expect(controlTemp._names.array).toEqual(new Set(['test']));
    });

    it('should unset field array values correctly on DOM removing', async () => {
      interface NestedComponentProps
        extends Pick<UseFormReturn<FormValues>, 'control' | 'register'> {
        childIndex: number;
      }

      type FormValues = {
        test: {
          title: string;
          nested: {
            name: string;
          }[];
        }[];
        title: string;
      };

      const NestedComponent = ({
        childIndex,
        control,
        register,
      }: NestedComponentProps) => {
        const { fields } = useFieldArray({
          control,
          name: `test.${childIndex}.nested` as `test.0.nested`,
        });

        return (
          <div>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input
                    {...register(
                      `test.${childIndex}.nested.${index}.name` as const,
                    )}
                  />
                </div>
              );
            })}
          </div>
        );
      };

      const Component = () => {
        const { control, register } = useForm<FormValues>();
        const { fields, append, remove } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            <input {...register('title')} />
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input {...register(`test.${index}.title` as const)} />
                  <button type="button" onClick={() => remove(index)}>
                    Remove child
                  </button>
                  <NestedComponent
                    childIndex={index}
                    control={control}
                    register={register}
                  />
                </div>
              );
            })}
            <button type="button" onClick={() => append({ title: 'test' })}>
              Add child
            </button>
          </form>
        );
      };

      render(<Component />);

      const addChild = async () =>
        await actComponent(
          async () => await screen.getByText('Add child').click(),
        );

      await addChild();

      expect(screen.getByText('Remove child')).toBeInTheDocument();

      await actComponent(
        async () => await screen.getByText('Remove child').click(),
      );

      expect(screen.queryByText('Remove child')).toBeNull();

      await addChild();

      expect(screen.getByText('Remove child')).toBeInTheDocument();
    });
  });

  describe('with should unregister true', () => {
    it('should not unregister field if unregister method is triggered', () => {
      let getValues: any;
      const Component = () => {
        const {
          register,
          unregister,
          control,
          getValues: tempGetValues,
        } = useForm();
        const { fields, append } = useFieldArray({ name: 'test', control });
        getValues = tempGetValues;

        React.useEffect(() => {
          if (fields.length >= 3) {
            unregister('test');
          }
        }, [fields, unregister]);

        return (
          <div>
            {fields.map((_, i) => (
              <input key={i.toString()} {...register(`test.${i}.value`)} />
            ))}
            <button type={'button'} onClick={() => append({ value: '' })}>
              append
            </button>
          </div>
        );
      };

      render(<Component />);

      const button = screen.getByRole('button', { name: /append/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(getValues()).toEqual({
        test: [{ value: '' }, { value: '' }, { value: '' }],
      });
    });

    it('should remove field array after useFieldArray is unmounted', () => {
      type FormValues = {
        test: { name: string }[];
      };

      const FieldArray = ({ control }: { control: Control<FormValues> }) => {
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <div>
            {fields.map((item, index) => {
              return (
                <input key={item.id} name={`test.${index}.name` as const} />
              );
            })}
          </div>
        );
      };

      const App = () => {
        const [show, setShow] = React.useState(true);
        const { control } = useForm<FormValues>({
          shouldUnregister: true,
          defaultValues: {
            test: [{ name: 'test' }],
          },
        });

        return (
          <div>
            {show && <FieldArray control={control} />}
            <button type={'button'} onClick={() => setShow(!show)}>
              toggle
            </button>
          </div>
        );
      };

      render(<App />);

      screen.getByRole('textbox');

      fireEvent.click(screen.getByRole('button'));

      expect(screen.queryByRole('textbox')).toBeNull();
    });
  });

  describe('setError', () => {
    it('should be able to set an field array error', async () => {
      const Component = () => {
        const {
          register,
          setError,
          control,
          formState: { errors },
        } = useForm();
        const { fields, append, remove } = useFieldArray({
          name: 'test',
          control,
        });

        React.useEffect(() => {
          if (fields.length === 0) {
            setError('test', {
              type: 'min length',
            });
          }
        }, [fields, setError]);

        return (
          <div>
            {fields.map((_, i) => (
              <div key={i.toString()}>
                <input {...register(`test.${i}.value`)} />
                <button type={'button'} onClick={() => remove(i)}>
                  delete
                </button>
              </div>
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button>submit</button>
            <p>{errors.test && 'Error'}</p>
          </div>
        );
      };

      render(<Component />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'delete' }));
      });

      screen.getByText('Error');
    });
  });

  describe('with reset', () => {
    it('should reset with field array', async () => {
      let fieldsTemp: unknown[] = [];

      const App = () => {
        const { register, reset, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
        });
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        });
        fieldsTemp = fields;

        return (
          <form>
            {fields.map((field, index) => {
              return (
                <input key={field.id} {...register(`test.${index}.value`)} />
              );
            })}

            <button
              type={'button'}
              onClick={() => {
                append({ value: 'test' });
              }}
            >
              append
            </button>

            <button
              type={'button'}
              onClick={() => {
                reset();
              }}
            >
              reset
            </button>
          </form>
        );
      };

      render(<App />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'reset' }));
      });

      expect(fieldsTemp).toEqual([{ id: '4', value: 'default' }]);
    });

    it('should reset with field array with shouldUnregister set to false', () => {
      const { result } = renderHook(() => {
        const { register, reset, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
        });
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        });
        return { register, reset, fields, append };
      });

      act(() => {
        result.current.append({ value: 'test' });
      });

      result.current.register('test.0.value');

      act(() => {
        result.current.reset();
      });

      expect(result.current.fields).toEqual([{ id: '4', value: 'default' }]);

      act(() => {
        result.current.reset({
          test: [{ value: 'data' }],
        });
      });

      expect(result.current.fields).toEqual([{ id: '6', value: 'data' }]);
    });

    it('should reset with async', async () => {
      type FormValues = {
        test: {
          value: string;
          nestedArray: {
            value: string;
          }[];
        }[];
      };

      const Nested = ({
        index,
        control,
      }: {
        control: Control<FormValues>;
        index: number;
      }) => {
        const { fields } = useFieldArray<FormValues>({
          name: `test.${index}.nestedArray` as const,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `test.${index}.nestedArray.${i}.value` as const,
                )}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, reset, control } = useForm<FormValues>();
        const { fields } = useFieldArray({
          name: 'test',
          control,
        });

        React.useEffect(() => {
          setTimeout(() => {
            reset({
              test: [
                { value: '1', nestedArray: [{ value: '2' }] },
                { value: '3', nestedArray: [{ value: '4' }] },
              ],
            });
          });
        }, [reset]);

        return (
          <form>
            {fields.map((item, i) => (
              <fieldset key={item.id}>
                <input {...register(`test.${i}.value` as const)} />

                <Nested control={control} index={i} />
              </fieldset>
            ))}
          </form>
        );
      };

      render(<Component />);

      await waitFor(() =>
        expect(screen.getAllByRole('textbox')).toHaveLength(4),
      );
    });
  });

  describe('with setValue', () => {
    it.each(['isDirty', 'dirtyFields'])(
      'should set name to dirtyFieldRef if array field values are different with default value when formState.%s is defined',
      async (property) => {
        let setValue: any;
        let formState: any;
        const Component = () => {
          const {
            register,
            control,
            formState: tempFormState,
            setValue: tempSetValue,
            watch,
          } = useForm({
            defaultValues: {
              test: [
                { name: 'default' },
                { name: 'default1' },
                { name: 'default2' },
              ],
            },
          });
          const { fields } = useFieldArray({ name: 'test', control });
          watch();

          setValue = tempSetValue;
          formState = tempFormState;
          formState[property];

          return (
            <form>
              {fields.map((field, i) => (
                <input
                  key={field.id}
                  {...register(`test.${i}.name` as const)}
                />
              ))}
            </form>
          );
        };

        render(<Component />);

        await actComponent(async () => {
          setValue(
            'test',
            [
              { name: 'default_update' },
              { name: 'default1' },
              { name: 'default2' },
            ],
            { shouldDirty: true },
          );
        });

        if (property === 'dirtyFields') {
          expect(formState.dirtyFields).toEqual({
            test: [{ name: true }],
          });
        } else {
          expect(formState.isDirty).toBeTruthy();
        }
      },
    );

    it.each(['dirtyFields'])(
      'should unset name from dirtyFieldRef if array field values are not different with default value when formState.%s is defined',
      (property) => {
        let setValue: any;
        let formState: any;
        const Component = () => {
          const {
            register,
            control,
            formState: tempFormState,
            setValue: tempSetValue,
          } = useForm({
            defaultValues: {
              test: [
                { name: 'default' },
                { name: 'default1' },
                { name: 'default2' },
              ],
            },
          });
          const { fields } = useFieldArray({ name: 'test', control });

          setValue = tempSetValue;
          formState = tempFormState;
          formState[property];

          return (
            <form>
              {fields.map((field, i) => (
                <input
                  key={field.id}
                  {...register(`test.${i}.name` as const)}
                />
              ))}
            </form>
          );
        };

        render(<Component />);

        actComponent(() => {
          setValue(
            'test',
            [
              { name: 'default_update' },
              { name: 'default1' },
              { name: 'default2' },
            ],
            { shouldDirty: true },
          );
        });

        if (property === 'dirtyFields') {
          expect(formState.dirtyFields).toEqual({
            test: [{ name: true }],
          });
        } else {
          expect(formState.isDirty).toBeTruthy();
        }

        actComponent(() => {
          setValue(
            'test',
            [{ name: 'default' }, { name: 'default1' }, { name: 'default2' }],
            { shouldDirty: true },
          );
        });

        expect(formState.dirtyFields).toEqual({
          test: [
            {
              name: undefined,
            },
          ],
        });
        expect(formState.isDirty).toBeFalsy();
      },
    );

    it('should set nested field array correctly', async () => {
      type FormValues = {
        test: {
          firstName: string;
          lastName: string;
          keyValue: { name: string }[];
        }[];
      };

      function NestedArray({
        control,
        index,
      }: {
        control: Control<FormValues>;
        index: number;
      }) {
        const { fields } = useFieldArray({
          name: `test.${index}.keyValue` as 'test.0.keyValue',
          control,
        });

        return (
          <ul>
            {fields.map((item, i) => (
              <Controller
                key={item.id}
                render={({ field }) => (
                  <input
                    {...field}
                    aria-label={`test.${index}.keyValue.${i}.name`}
                  />
                )}
                name={`test.${index}.keyValue.${i}.name` as const}
                control={control}
              />
            ))}
          </ul>
        );
      }

      function Component() {
        const { register, control, setValue } = useForm<FormValues>({
          defaultValues: {
            test: [
              {
                firstName: 'Bill',
                lastName: 'Luo',
                keyValue: [{ name: '1a' }, { name: '1c' }],
              },
            ],
          },
        });
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map((item, index) => {
              return (
                <div key={item.id}>
                  <input
                    aria-label={`test.${index}.firstName`}
                    {...register(`test.${index}.firstName` as const)}
                  />
                  <NestedArray control={control} index={index} />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setValue('test.0.keyValue', [{ name: '2a' }])}
            >
              setValue
            </button>
          </form>
        );
      }

      render(<Component />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'setValue' }));
      });

      const input = screen.getByLabelText(
        'test.0.keyValue.0.name',
      ) as HTMLInputElement;

      expect(input.value).toEqual('2a');

      expect(
        (screen.getByLabelText('test.0.firstName') as HTMLInputElement).value,
      ).toEqual('Bill');
    });
  });

  describe('array of array fields', () => {
    it('should remove correctly with nested field array and set shouldUnregister to false', () => {
      type FormValues = {
        fieldArray: {
          value: string;
          nestedFieldArray: {
            value: string;
          }[];
        }[];
      };

      const ArrayField = ({
        arrayIndex,
        register,
        control,
      }: {
        arrayIndex: number;
        register: UseFormReturn<FormValues>['register'];
        arrayField: Partial<FieldValues>;
        control: Control<FormValues>;
      }) => {
        const { fields, append, remove } = useFieldArray<FormValues>({
          name: `fieldArray.${arrayIndex}.nestedFieldArray` as const,
          control,
        });

        return (
          <div>
            <input {...register(`fieldArray.${arrayIndex}.value` as const)} />
            {fields.map((nestedField, index) => (
              <div key={nestedField.id}>
                <input
                  {...register(
                    `fieldArray.${arrayIndex}.nestedFieldArray.${index}.value` as const,
                  )}
                />
                <button type="button" onClick={() => remove(index)}>
                  remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                append({
                  value:
                    `fieldArray.${arrayIndex}.nestedFieldArray.${fields.length}.value` as const,
                });
              }}
            >
              Add nested array
            </button>
          </div>
        );
      };

      const Component = () => {
        const { register, control } = useForm<FormValues>();
        const { fields, append } = useFieldArray({
          name: 'fieldArray',
          control,
        });

        return (
          <form>
            {fields.map((field, index) => (
              <ArrayField
                key={field.id}
                arrayIndex={index}
                arrayField={field}
                register={register}
                control={control}
              />
            ))}

            <button
              type="button"
              onClick={() => {
                append({
                  value: `fieldArray[${fields.length}].value`,
                });
              }}
            >
              Add array
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Add array',
        }),
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Add nested array',
        }),
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Add nested array',
        }),
      );

      fireEvent.click(
        screen.getAllByRole('button', {
          name: 'remove',
        })[0],
      );

      fireEvent.click(
        screen.getAllByRole('button', {
          name: 'remove',
        })[0],
      );

      expect(screen.getAllByRole('textbox').length).toEqual(1);
    });

    it('should prepend correctly with default values on nested array fields', () => {
      type FormInputs = {
        nest: {
          test: {
            value: string;
            nestedArray: { value: string }[];
          }[];
        };
      };

      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control<FormInputs>;
        index: number;
      }) => {
        const { fields } = useFieldArray<FormInputs>({
          name: `nest.test.${index}.nestedArray` as const,
          control,
        });

        return (
          <>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `nest.test.${index}.nestedArray.${i}.value` as const,
                )}
              />
            ))}
          </>
        );
      };

      const Component = () => {
        const { register, control } = useForm<FormInputs>({
          defaultValues: {
            nest: {
              test: [
                { value: '1', nestedArray: [{ value: '2' }, { value: '3' }] },
                { value: '4', nestedArray: [{ value: '5' }] },
              ],
            },
          },
        });
        const { fields, prepend } = useFieldArray({
          name: 'nest.test',
          control,
        });

        return (
          <>
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`nest.test.${i}.value` as const)} />
                <ChildComponent control={control} index={i} />
              </div>
            ))}

            <button type={'button'} onClick={() => prepend({ value: 'test' })}>
              prepend
            </button>
          </>
        );
      };

      render(<Component />);

      expect(screen.getAllByRole('textbox')).toHaveLength(5);

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      expect(screen.getAllByRole('textbox')).toHaveLength(6);

      expect(
        (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
      ).toEqual('test');
    });

    it('should render correct amount of child array fields', async () => {
      type FormValues = {
        nest: {
          test: {
            value: string;
            nestedArray: {
              value: string;
            }[];
          }[];
        };
      };
      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control<FormValues>;
        index: number;
      }) => {
        const { fields } = useFieldArray<FormValues>({
          name: `nest.test.${index}.nestedArray` as const,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `nest.test.${index}.nestedArray.${i}.value` as const,
                )}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            nest: {
              test: [
                { value: '1', nestedArray: [{ value: '2' }] },
                { value: '3', nestedArray: [{ value: '4' }] },
              ],
            },
          },
        });
        const { fields, remove, append } = useFieldArray({
          name: 'nest.test',
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`nest.test.${i}.value` as const)} />

                <ChildComponent control={control} index={i} />

                <button
                  type={'button'}
                  onClick={() => remove(i)}
                  data-testid={item.value}
                >
                  remove
                </button>
              </div>
            ))}

            <button type={'button'} onClick={() => append({ value: 'test' })}>
              append
            </button>
          </div>
        );
      };

      render(<Component />);

      expect(screen.getAllByRole('textbox')).toHaveLength(4);

      fireEvent.click(screen.getByTestId('1'));

      expect(screen.getAllByRole('textbox')).toHaveLength(2);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      expect(screen.getAllByRole('textbox')).toHaveLength(3);
    });

    it('should populate all array fields with setValue when name match Field Array', async () => {
      type FormInputs = {
        nest: {
          value: number;
          nestedArray: {
            value: number;
          }[];
        }[];
      };

      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control<FormInputs>;
        index: number;
      }) => {
        const { fields } = useFieldArray<FormInputs>({
          name: `nest.${index}.nestedArray` as const,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `nest.${index}.nestedArray.${i}.value` as const,
                )}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, control, setValue } = useForm<FormInputs>();
        const { fields } = useFieldArray({
          name: 'nest',
          control,
        });

        React.useEffect(() => {
          setValue('nest', [
            {
              value: 1,
              nestedArray: [
                {
                  value: 1,
                },
              ],
            },
            {
              value: 2,
              nestedArray: [
                {
                  value: 1,
                },
              ],
            },
          ]);
        }, [setValue]);

        return (
          <div>
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`nest.${i}.value` as const)} />

                <ChildComponent control={control} index={i} />
              </div>
            ))}
          </div>
        );
      };

      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();
    });

    it('should populate all array fields correctly with setValue', async () => {
      type FormValues = {
        nest: {
          value: number;
          nestedArray: { value: number }[];
        }[];
      };

      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control<FormValues>;
        index: number;
      }) => {
        const { fields } = useFieldArray<FormValues>({
          name: `nest.${index}.nestedArray` as const,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `nest.${index}.nestedArray.${i}.value` as const,
                )}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, control, setValue } = useForm<FormValues>();
        const { fields } = useFieldArray({
          name: 'nest',
          control,
        });

        React.useEffect(() => {
          setValue(
            'nest',
            [
              {
                value: 1,
                nestedArray: [
                  {
                    value: 1,
                  },
                ],
              },
              {
                value: 2,
                nestedArray: [
                  {
                    value: 1,
                  },
                ],
              },
            ],
            { shouldDirty: true },
          );
        }, [setValue]);

        return (
          <div>
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`nest.${i}.value` as const)} />

                <ChildComponent control={control} index={i} />
              </div>
            ))}
          </div>
        );
      };

      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();
    });

    it('should worked with deep nested field array without chaining useFieldArray', async () => {
      type FormValues = {
        nest: {
          value: string;
          nestedArray: { deepNest: { value: string }[] };
        }[];
      };

      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control<FormValues>;
        index: number;
      }) => {
        const { fields, append } = useFieldArray<FormValues>({
          name: `nest.${index}.nestedArray.deepNest` as const,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                {...control.register(
                  `nest.${index}.nestedArray.deepNest.${i}.value` as const,
                )}
              />
            ))}
            <button type={'button'} onClick={() => append({ value: 'test' })}>
              append
            </button>
          </div>
        );
      };

      const Component = () => {
        const { register, control, setValue, reset } = useForm<FormValues>();
        const { fields } = useFieldArray({
          name: 'nest',
          control,
        });

        React.useEffect(() => {
          reset({
            nest: [
              {
                value: '1',
                nestedArray: {
                  deepNest: [
                    {
                      value: '1',
                    },
                  ],
                },
              },
            ],
          });
        }, [reset]);

        return (
          <div>
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`nest.${i}.value` as const)} />
                <ChildComponent control={control} index={i} />
                <button
                  type={'button'}
                  onClick={() => {
                    setValue(
                      'nest',
                      [
                        {
                          value: '1',
                          nestedArray: {
                            deepNest: [
                              {
                                value: '1',
                              },
                              {
                                value: '2',
                              },
                              {
                                value: '3',
                              },
                            ],
                          },
                        },
                      ],
                      { shouldDirty: true },
                    );
                  }}
                >
                  setValue
                </button>
              </div>
            ))}
          </div>
        );
      };

      const { asFragment } = render(<Component />);

      expect(asFragment()).toMatchSnapshot();

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'setValue' }));
      });

      expect(asFragment()).toMatchSnapshot();

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      expect(asFragment()).toMatchSnapshot();
    });

    it('should allow append with deeply nested field array even with flat structure', async () => {
      const watchValue: unknown[] = [];

      const App = () => {
        const [data, setData] = React.useState({});
        const { control, handleSubmit, watch } = useForm<{
          test: {
            yourDetails: {
              firstName: string[];
              lastName: string[];
            };
          }[];
        }>();
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        watchValue.push(watch());

        return (
          <form
            onSubmit={handleSubmit((data) => {
              setData(data);
            })}
          >
            {fields.map((field) => {
              return <div key={field.id} />;
            })}
            <button
              type={'button'}
              onClick={() => {
                append({
                  yourDetails: {
                    firstName: ['test', 'test1'],
                    lastName: ['test', 'test1'],
                  },
                });
              }}
            >
              append
            </button>
            <button>submit</button>
            <p>{JSON.stringify(data)}</p>
          </form>
        );
      };

      render(<App />);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      expect(watchValue).toMatchSnapshot();

      actComponent(() => {
        screen.getByText(
          '{"test":[{"yourDetails":{"firstName":["test","test1"],"lastName":["test","test1"]}}]}',
        );
      });
    });
  });

  describe('submit form', () => {
    it('should not leave defaultValues as empty array', async () => {
      let submitData: any;
      type FormValues = {
        test: {
          value: string;
        }[];
      };
      const Component = () => {
        const { register, control, handleSubmit } = useForm<FormValues>({
          defaultValues: {
            test: [],
          },
        });
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });
        const onSubmit: SubmitHandler<FormValues> = (data) => {
          submitData = data;
        };

        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);
      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(submitData).toEqual({
        test: [],
      });
    });
  });

  it('should custom register append, prepend and insert inputs with values', () => {
    type FormValues = {
      test: {
        test: string;
        test1: string;
        test2: {
          test: string;
        }[];
      }[];
    };
    const watchValues: unknown[] = [];

    const Component = () => {
      const { control, watch } = useForm<FormValues>({
        defaultValues: {
          test: [],
        },
      });
      const { append, prepend, insert } = useFieldArray({
        control,
        name: 'test',
      });

      watchValues.push(watch('test'));

      React.useEffect(() => {
        append({
          test: 'append',
          test1: 'append',
        });
      }, [append]);

      return (
        <form>
          <button
            type={'button'}
            onClick={() =>
              prepend({
                test: 'prepend',
                test1: 'prepend',
              })
            }
          >
            prepend
          </button>
          <button
            type={'button'}
            onClick={() =>
              insert(1, {
                test: 'insert',
                test1: 'insert',
              })
            }
          >
            insert
          </button>

          <button
            type={'button'}
            onClick={() =>
              prepend({
                test: 'prepend',
                test2: [
                  {
                    test: 'test',
                  },
                ],
              })
            }
          >
            deep append
          </button>
          <button
            type={'button'}
            onClick={() =>
              append({
                test: 'prepend',
                test2: [
                  {
                    test: 'test',
                  },
                ],
              })
            }
          >
            deep prepend
          </button>
          <button
            type={'button'}
            onClick={() =>
              insert(1, {
                test: 'insert',
                test2: [
                  {
                    test: 'test',
                  },
                ],
              })
            }
          >
            deep insert
          </button>
        </form>
      );
    };

    render(<Component />);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'prepend' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'insert' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'deep append' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'deep prepend' }));
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'deep insert' }));
    });

    expect(watchValues).toMatchSnapshot();
  });

  it('should append multiple inputs correctly', () => {
    type FormValues = {
      test: {
        value: string;
      }[];
    };

    const watchedValue: unknown[] = [];

    const Component = () => {
      const { register, control, watch } = useForm<FormValues>({
        defaultValues: {
          test: [
            {
              value: 'data',
            },
          ],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'test',
      });

      watchedValue.push(watch());

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button
            type="button"
            onClick={() => {
              append([{ value: 'test' }, { value: 'test1' }]);
            }}
          >
            append
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    expect(watchedValue).toMatchSnapshot();
  });

  it('should update field array defaultValues when invoke setValue', async () => {
    type FormValues = {
      names: {
        name: string;
      }[];
    };

    const result: unknown[] = [];

    const Child = () => {
      const { fields } = useFieldArray<FormValues>({
        name: 'names',
      });

      return (
        <>
          {fields.map((item, index) => (
            <Controller
              key={item.id}
              name={`names.${index}.name` as const}
              render={({ field }) => <input {...field} />}
            />
          ))}
        </>
      );
    };

    function Component() {
      const [hide, setHide] = React.useState(true);
      const methods = useForm<FormValues>({
        defaultValues: {
          names: [{ name: 'will' }, { name: 'Mike' }],
        },
      });
      const { setValue } = methods;

      result.push(methods.watch());

      return (
        <form>
          <FormProvider {...methods}>{hide && <Child />}</FormProvider>
          <button type={'button'} onClick={() => setValue('names', [])}>
            Change value
          </button>
          <button type={'button'} onClick={() => setHide(!hide)}>
            Toggle hide
          </button>
        </form>
      );
    }

    render(<Component />);

    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle hide' }));
    });

    expect(screen.queryAllByRole('textbox')).toEqual([]);

    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Change value' }));
    });

    actComponent(() => {
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    actComponent(() => {
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Toggle hide' }));
    });

    actComponent(() => {
      expect(screen.queryByRole('textbox')).toBeNull();
    });

    expect(result).toMatchSnapshot();
  });

  it('should unregister field array when shouldUnregister set to true', () => {
    type FormValues = {
      test: {
        value: string;
      }[];
    };

    const watchedValues: FormValues[] = [];

    const Child = ({
      control,
      register,
    }: {
      show: boolean;
      control: Control<FormValues>;
      register: UseFormRegister<FormValues>;
    }) => {
      const { fields } = useFieldArray({
        control,
        name: 'test',
        shouldUnregister: true,
      });

      return (
        <>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
        </>
      );
    };

    const Component = () => {
      const { register, control, watch } = useForm<FormValues>({
        defaultValues: {
          test: [{ value: 'test' }, { value: 'test1' }],
        },
      });
      const [show, setShow] = React.useState(true);

      watchedValues.push(watch());

      return (
        <form>
          {show && <Child register={register} control={control} show={show} />}
          <button type="button" onClick={() => setShow(!show)}>
            toggle
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button'));

    expect(watchedValues).toMatchSnapshot();
  });

  it('should keep field values when field array gets unmounted and mounted', async () => {
    type FormValues = {
      test: { firstName: string }[];
    };

    const Test = ({
      register,
      control,
    }: {
      register: UseFormRegister<FormValues>;
      control: Control<FormValues>;
    }) => {
      const { fields, append } = useFieldArray({
        name: 'test',
        control,
      });

      return (
        <div>
          {fields.map((field, i) => {
            return (
              <input
                key={field.id}
                {...register(`test.${i}.firstName` as const)}
              />
            );
          })}
          <button
            onClick={() =>
              append({
                firstName: 'test',
              })
            }
          >
            append
          </button>
        </div>
      );
    };

    const App = () => {
      const { control, register } = useForm<FormValues>();
      const [show, setShow] = React.useState(true);

      return (
        <>
          {show && <Test control={control} register={register} />}
          <button onClick={() => setShow(!show)}>show</button>
        </>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));
    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'show' }));
    });

    expect(screen.queryByRole('textbox')).toBeNull();

    actComponent(() => {
      fireEvent.click(screen.getByRole('button', { name: 'show' }));
    });

    expect(screen.getAllByRole('textbox').length).toEqual(2);
  });

  it('should append deep nested field array correctly with strict mode', async () => {
    function App() {
      const { control, register, handleSubmit } = useForm<{
        test: {
          yourDetail: {
            firstName: string;
            lastName: string;
          };
        }[];
      }>();
      const { fields, append } = useFieldArray({
        name: 'test',
        control,
      });

      return (
        <React.StrictMode>
          <form onSubmit={handleSubmit(() => {})}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input {...register(`test.${index}.yourDetail.firstName`)} />
                  <input {...register(`test.${index}.yourDetail.lastName`)} />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() =>
                append({
                  yourDetail: {
                    firstName: 'bill',
                    lastName: 'luo',
                  },
                })
              }
            >
              Append
            </button>
            <input type="submit" />
          </form>
        </React.StrictMode>
      );
    }

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Append' }));
    });

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('bill');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('luo');
  });

  it('should not populate defaultValue when field array is already mounted', async () => {
    type FormValues = {
      root: {
        test: string;
        children: { name: string }[];
      }[];
    };

    const Child = ({
      control,
      index,
      register,
    }: {
      control: Control<FormValues>;
      index: number;
      register: UseFormRegister<FormValues>;
    }) => {
      const { fields, append } = useFieldArray({
        name: `root.${index}.children`,
        control,
      });

      return (
        <div>
          {fields.map((field, k) => {
            return (
              <div key={field.id}>
                <input {...register(`root.${index}.children.${k}.name`)} />
              </div>
            );
          })}

          <button
            onClick={() => {
              append({
                name: 'test',
              });
            }}
          >
            append
          </button>
        </div>
      );
    };

    const App = () => {
      const { register, control } = useForm<FormValues>({
        defaultValues: {
          root: [
            {
              test: 'default',
              children: [
                {
                  name: 'child of index 0',
                },
              ],
            },
            {
              test: 'default1',
              children: [],
            },
          ],
        },
      });
      const { fields, swap } = useFieldArray({
        control,
        name: 'root',
      });

      return (
        <div>
          {fields.map((field, index) => {
            return (
              <div key={field.id}>
                <input {...register(`root.${index}.test` as const)} />
                <Child control={control} register={register} index={index} />
              </div>
            );
          })}
          <button
            type={'button'}
            onClick={() => {
              swap(0, 1);
            }}
          >
            swap
          </button>
        </div>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'swap' }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'append' })[0]);
    });

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('default1');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('test');
    expect(
      (screen.getAllByRole('textbox')[2] as HTMLInputElement).value,
    ).toEqual('default');
    expect(
      (screen.getAllByRole('textbox')[3] as HTMLInputElement).value,
    ).toEqual('child of index 0');
  });

  it('should update field array correctly when unmounted field', () => {
    type FormValues = {
      nest: {
        value: string;
        nested: {
          value: string;
        }[];
      }[];
    };

    function Nested({
      control,
      register,
      index,
    }: {
      control: Control<FormValues>;
      register: UseFormRegister<FormValues>;
      index: number;
    }) {
      const { fields } = useFieldArray({
        control,
        name: `nest.${index}.nested`,
      });

      return (
        <>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`nest.${index}.nested.${i}.value`)}
            />
          ))}
        </>
      );
    }

    function App() {
      const { control, register, setValue, getValues } = useForm<FormValues>({
        defaultValues: {
          nest: [
            { value: '0', nested: [{ value: '0sub1' }, { value: '0sub2' }] },
            { value: '1', nested: [{ value: '1sub1' }, { value: '1sub2' }] },
            { value: '2', nested: [{ value: '2sub1' }, { value: '2sub2' }] },
          ],
        },
      });
      const { fields, remove } = useFieldArray({
        control,
        name: 'nest',
      });

      function handleAddInner() {
        setValue(`nest.1.nested`, [
          ...getValues(`nest.1.nested`),
          { value: `1sub-new` },
        ]);
      }

      return (
        <>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`nest.${index}.value`)} />
              <button type={'button'} onClick={() => remove(index)}>
                remove{index}
              </button>
              <Nested index={index} {...{ control, register }} />
            </div>
          ))}

          <button onClick={handleAddInner}>set</button>
        </>
      );
    }

    render(<App />);

    expect(screen.getAllByRole('textbox').length).toEqual(9);

    fireEvent.click(screen.getByRole('button', { name: 'remove1' }));

    actComponent(() => {
      expect(screen.getAllByRole('textbox').length).toEqual(6);
    });

    fireEvent.click(screen.getByRole('button', { name: 'set' }));

    actComponent(() => {
      expect(screen.getAllByRole('textbox').length).toEqual(7);
      expect(
        (screen.getAllByRole('textbox')[6] as HTMLInputElement).value,
      ).toEqual('1sub-new');
    });
  });

  it('should update field array correctly with async invocation', async () => {
    type FormValues = {
      items: { id: string; name: string }[];
    };

    let controlObj: any = {};

    const App = () => {
      const { register, control } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
          items: [{ name: 'one' }, { name: 'two' }],
        },
      });

      controlObj = control;

      const { fields, remove, insert } = useFieldArray({
        control,
        name: 'items',
      });

      return (
        <form>
          {fields.map((field, index) => {
            return (
              <div key={field.id}>
                <button
                  type="button"
                  onClick={() => {
                    setTimeout(() => {
                      remove(index);
                    });
                  }}
                >
                  remove
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeout(() => {
                      insert(index + 1, {
                        name: 'test',
                      });
                    });
                  }}
                >
                  copy
                </button>
                <input
                  {...register(`items.${index}.name` as const, {
                    required: true,
                  })}
                />
              </div>
            );
          })}
        </form>
      );
    };

    render(<App />);

    await actComponent(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'copy' })[0]);
    });

    await actComponent(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);
    });

    expect(controlObj._fields.items.length).toEqual(2);
  });
});
