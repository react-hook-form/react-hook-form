import * as React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act as actComponent,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from '../useFieldArray';
import { useForm } from '../useForm';
import * as generateId from '../logic/generateId';
import { Controller } from '../controller';
import { FormProvider } from '../useFormContext';
import { Control, SubmitHandler, UseFormReturn, FieldValues } from '../types';
import isFunction from '../utils/isFunction';

export const mockGenerateId = () => {
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
                  defaultValue={field.value}
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
              <input
                key={field.id}
                {...register(`test.${i}.value` as const)}
                defaultValue={field.value}
              />
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <span>{isValid && 'valid'}</span>
          </div>
        );
      };

      render(<Component />);

      await waitFor(() => screen.getByText('valid'));

      await act(async () => {
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
                defaultValue={item.value}
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
                <input
                  {...register(`test.${i}.value` as const)}
                  defaultValue={item.value}
                />

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

      fireEvent.click(screen.getByRole('button', { name: 'Append Nest' }));

      await waitFor(() => screen.getByText('valid'));

      expect(formData).toEqual({
        test: [
          {
            value: '1',
            nestedArray: [{ value: '2' }, { value: 'test' }],
          },
        ],
      });

      fireEvent.click(screen.getByRole('button', { name: 'delete' }));

      expect(formData).toEqual({
        test: [],
      });
    });
  });

  describe('when component unMount', () => {
    it('should keep field array values', () => {
      let getValues: any;
      const Component = () => {
        const { register, control, getValues: tempGetValues } = useForm();
        const { fields, append } = useFieldArray({ name: 'test', control });
        getValues = tempGetValues;

        return (
          <div>
            {fields.map((_, i) => (
              <input key={i.toString()} {...register(`test.${i}.value`)} />
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
          </div>
        );
      };

      const { unmount } = render(<Component />);

      const button = screen.getByRole('button', { name: /append/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      unmount();

      expect(getValues()).toEqual({
        test: [{ value: '' }, { value: '' }, { value: '' }],
      });
    });

    it('should remove reset method when field array is removed', () => {
      const { result, unmount } = renderHook(() => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
        });
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        });
        return { register, control, fields, append };
      });

      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'test[0].value';

      const { ref } = result.current.register('test.0.value');

      isFunction(ref) && ref(input);

      act(() => {
        result.current.append({ value: 'test' });
      });

      unmount();

      expect(result.current.fields).toEqual([
        { id: '0', value: 'default' },
        { id: '1', value: 'test' },
      ]);
      expect(result.current.control.fieldArrayNamesRef.current).toEqual(
        new Set(),
      );
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
                <>
                  <input
                    defaultValue={field.name}
                    {...register(
                      `test.${childIndex}.nested.${index}.name` as const,
                    )}
                  />
                </>
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
                  <input
                    defaultValue={field.title}
                    {...register(`test.${index}.title` as const)}
                  />
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

  describe('unregister', () => {
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
            <button onClick={() => append({ value: '' })}>append</button>
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
  });

  describe('with reset', () => {
    it('should reset with field array', () => {
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

      expect(result.current.fields).toEqual([{ id: '2', value: 'default' }]);
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

      expect(result.current.fields).toEqual([{ id: '2', value: 'default' }]);

      act(() => {
        result.current.reset({
          test: [{ value: 'data' }],
        });
      });

      expect(result.current.fields).toEqual([{ id: '4', value: 'data' }]);
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
                defaultValue={item.value}
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
                <input
                  {...register(`test.${i}.value` as const)}
                  defaultValue={item.value}
                />

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
      (property) => {
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
                  key={i.toString()}
                  {...register(`test.${i}.name` as const)}
                  defaultValue={field.name}
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
                  key={i.toString()}
                  {...register(`test.${i}.name` as const)}
                  defaultValue={field.name}
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

    it('should set nested field array correctly', () => {
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
                defaultValue={item.name}
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
                    defaultValue={`${item.firstName}`}
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

      fireEvent.click(screen.getByRole('button', { name: 'setValue' }));

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
        arrayField,
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
            <input
              {...register(`fieldArray.${arrayIndex}.value` as const)}
              defaultValue={arrayField.value}
            />
            {fields.map((nestedField, index) => (
              <div key={nestedField.id}>
                <input
                  {...register(
                    `fieldArray.${arrayIndex}.nestedFieldArray.${index}.value` as const,
                  )}
                  defaultValue={nestedField.value}
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
                  value: `fieldArray.${arrayIndex}.nestedFieldArray.${fields.length}.value` as const,
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
                defaultValue={item.value}
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
                <input
                  {...register(`nest.test.${i}.value` as const)}
                  defaultValue={item.value}
                />
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
                defaultValue={item.value}
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
                <input
                  {...register(`nest.test.${i}.value` as const)}
                  defaultValue={item.value}
                />

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
          value: string;
          nestedArray: {
            value: string;
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
                defaultValue={item.value}
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
                <input
                  {...register(`nest.${i}.value` as const)}
                  defaultValue={item.value}
                />

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
          value: string;
          nestedArray: { value: string }[];
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
                defaultValue={item.value}
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
                <input
                  {...register(`nest.${i}.value` as const)}
                  defaultValue={item.value}
                />

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
                defaultValue={item.value}
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
                <input
                  {...register(`nest.${i}.value` as const)}
                  defaultValue={item.value}
                />
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
        await fireEvent.click(screen.getByRole('button', { name: 'setValue' }));
      });

      expect(asFragment()).toMatchSnapshot();

      await actComponent(async () => {
        await fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      expect(asFragment()).toMatchSnapshot();
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
        await fireEvent.click(screen.getByRole('button'));
      });

      expect(submitData).toEqual({
        test: [],
      });
    });
  });
});
