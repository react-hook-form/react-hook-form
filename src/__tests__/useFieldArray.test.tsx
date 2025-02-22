import React, { useState } from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { Controller } from '../controller';
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
import { useFormState } from '../useFormState';
import noop from '../utils/noop';

let i = 0;

jest.mock('../logic/generateId', () => () => String(i++));

describe('useFieldArray', () => {
  beforeEach(() => {
    i = 0;
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
      const Provider = ({ children }: { children: React.ReactNode }) => {
        const methods = useForm();
        return <FormProvider {...methods}>{children}</FormProvider>;
      };
      expect(() =>
        renderHook(() => useFieldArray({ name: 'test' }), {
          wrapper: Provider,
        }),
      ).not.toThrow();
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
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
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

      expect(await screen.findByRole('textbox')).toBeVisible();
      expect(await screen.findByText('not valid')).toBeVisible();
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

      fireEvent.click(screen.getByRole('button'));

      fireEvent.click(screen.getByRole('button'));

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

      expect(await screen.findByText('valid')).toBeVisible();

      fireEvent.click(screen.getByRole('button'));

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

      fireEvent.click(screen.getByRole('button', { name: 'Append Nest' }));

      expect(await screen.findByText('valid')).toBeVisible();

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

    it('should report field array error during user action', async () => {
      const App = () => {
        const {
          register,
          control,
          formState: { errors },
        } = useForm<{
          test: { value: string }[];
        }>({
          mode: 'onChange',
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

      expect(screen.queryByText('minLength')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button'));

      expect(await screen.findByText('minLength')).toBeVisible();
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
          mode: 'onChange',
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
        const { fields } = useFieldArray({
          name: 'test',
          control,
        });

        return (
          <form>
            {errors.test && <p>minLength</p>}

            {fields.map((item, i) => (
              <fieldset key={item.id}>
                <input {...register(`test.${i}.value` as const)} />
              </fieldset>
            ))}
          </form>
        );
      };

      render(<App />);

      expect(screen.queryByText('minLength')).not.toBeInTheDocument();
    });

    it('should update error when user action corrects it', async () => {
      const App = () => {
        const {
          register,
          control,
          formState: { errors },
        } = useForm<{
          test: { value: string }[];
        }>({
          mode: 'onChange',
          resolver: (data) => {
            if (data.test.length > 1) {
              return {
                values: data,
                errors: {},
              };
            } else {
              return {
                values: data,
                errors: {
                  test: {
                    type: 'test',
                    message: 'minLength',
                  },
                },
              };
            }
          },
          defaultValues: {
            test: [],
          },
        });
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        });

        return (
          <form>
            {errors.test && <p>minLength</p>}
            {fields.map((item, i) => (
              <input key={item.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button
              type={'button'}
              onClick={() =>
                append({
                  value: '',
                })
              }
            >
              append
            </button>
          </form>
        );
      };

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(screen.queryByText('minLength')).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(screen.queryByText('minLength')).not.toBeInTheDocument(),
      );
    });

    it('should update error when array is changed', async () => {
      const App = () => {
        const {
          register,
          control,
          formState: { errors },
        } = useForm<{
          test: { value: string }[];
        }>({
          mode: 'onChange',
          resolver: (data) => {
            const errors: { test?: any } = {};
            if (data.test.length > 4) {
              errors.test = { type: 'toobig', message: 'WAY too many items' };
            } else if (data.test.length > 3) {
              errors.test = { type: 'toobig', message: 'Too many items' };
            }
            for (const [index, item] of data.test.entries()) {
              if (item.value === '') {
                errors.test = errors.test || [];
                errors.test[index] = {
                  value: { type: 'required', message: 'Required' },
                };
              }
            }

            return {
              values: data,
              errors,
            };
          },
          defaultValues: {
            test: [{ value: '0' }, { value: '1' }, { value: '2' }],
          },
        });
        const { fields, append, remove } = useFieldArray({
          name: 'test',
          control,
        });

        return (
          <form>
            {errors.test?.type && <p>Array error: {errors.test.message}</p>}
            {fields.map((item, i) => (
              <div key={item.id}>
                <input {...register(`test.${i}.value` as const)} />
                <button type="button" onClick={() => remove(i)}>
                  remove
                </button>
                {errors.test?.[i]?.value && (
                  <span>
                    Item {i} error: {errors.test?.[i]?.value?.message}
                  </span>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                append({
                  value: fields.length.toString(),
                })
              }
            >
              append
            </button>
          </form>
        );
      };

      render(<App />);

      await waitFor(() =>
        expect(screen.queryByText('Array error:')).not.toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      await waitFor(() =>
        expect(
          screen.queryByText('Array error: Too many items'),
        ).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      await waitFor(() =>
        expect(
          screen.queryByText('Array error: WAY too many items'),
        ).toBeInTheDocument(),
      );

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);

      await waitFor(() =>
        expect(
          screen.queryByText('Array error: Too many items'),
        ).toBeInTheDocument(),
      );

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);

      await waitFor(() =>
        expect(screen.queryByText('Array error:')).not.toBeInTheDocument(),
      );

      fireEvent.change(screen.getAllByRole('textbox')[0], {
        target: { value: '' },
      });

      await waitFor(() =>
        expect(
          screen.queryByText('Item 0 error: Required'),
        ).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      await waitFor(() => {
        expect(
          screen.queryByText('Array error: Too many items'),
        ).toBeInTheDocument();
        expect(
          screen.queryByText('Item 0 error: Required'),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      await waitFor(() => {
        expect(
          screen.queryByText('Array error: WAY too many items'),
        ).toBeInTheDocument();
        expect(
          screen.queryByText('Item 0 error: Required'),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[4]);

      await waitFor(() => {
        expect(
          screen.queryByText('Array error: Too many items'),
        ).toBeInTheDocument();
        expect(
          screen.queryByText('Item 0 error: Required'),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[3]);

      await waitFor(() => {
        expect(
          screen.queryByText('Array error: Too many items'),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText('Item 0 error: Required'),
        ).toBeInTheDocument();
      });
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

      fireEvent.click(button);

      fireEvent.click(button);

      fireEvent.click(button);

      fireEvent.click(screen.getByRole('button', { name: 'setShow' }));

      expect(getValues()).toEqual({
        test: [{ value: '' }, { value: '' }, { value: '' }],
      });

      fireEvent.click(screen.getByRole('button', { name: 'setShow' }));
      expect(screen.getAllByRole('textbox').length).toEqual(3);
    });

    it('should remove reset method when field array is removed', () => {
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

      expect(fieldsTemp).toEqual([{ id: '0', value: 'default' }]);

      fireEvent.click(screen.getByRole('button'));

      expect(fieldsTemp).toEqual([
        { id: '0', value: 'default' },
        {
          id: '1',
          value: 'test',
        },
      ]);

      unmount();

      expect(controlTemp._names.array).toEqual(new Set(['test']));
      expect(fieldsTemp).toEqual([
        { id: '0', value: 'default' },
        {
          id: '1',
          value: 'test',
        },
      ]);
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
            <button
              type="button"
              onClick={() => append({ title: 'test', nested: [] })}
            >
              Add child
            </button>
          </form>
        );
      };

      render(<Component />);

      const addChild = () => fireEvent.click(screen.getByText('Add child'));

      addChild();

      expect(screen.getByText('Remove child')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Remove child'));

      expect(screen.queryByText('Remove child')).not.toBeInTheDocument();

      addChild();

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
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value`)} />
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

      expect(screen.getByRole('textbox')).toBeVisible();

      fireEvent.click(screen.getByRole('button'));

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
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

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      fireEvent.click(screen.getByRole('button', { name: 'submit' }));

      fireEvent.click(screen.getByRole('button', { name: 'delete' }));

      expect(await screen.findByText('Error')).toBeVisible();
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

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      fireEvent.click(screen.getByRole('button', { name: 'reset' }));

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

        await act(async () => {
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
            test: [{ name: true }, { name: false }, { name: false }],
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

        act(() => {
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
            test: [{ name: true }, { name: false }, { name: false }],
          });
        } else {
          expect(formState.isDirty).toBeTruthy();
        }

        act(() => {
          setValue(
            'test',
            [{ name: 'default' }, { name: 'default1' }, { name: 'default2' }],
            { shouldDirty: true },
          );
        });

        expect(formState.dirtyFields).toEqual({
          test: [
            {
              name: false,
            },
            {
              name: false,
            },
            {
              name: false,
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
                  nestedFieldArray: [],
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

            <button
              type={'button'}
              onClick={() => prepend({ value: 'test', nestedArray: [] })}
            >
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

            <button
              type={'button'}
              onClick={() => append({ value: 'test', nestedArray: [] })}
            >
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

    it('should populate all array fields with setValue when name match Field Array', () => {
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
              <label key={item.id}>
                {`nest.${index}.nestedArray.${i}.value`}
                <input
                  {...control.register(
                    `nest.${index}.nestedArray.${i}.value` as const,
                  )}
                />
              </label>
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
                  value: 11,
                },
              ],
            },
            {
              value: 2,
              nestedArray: [
                {
                  value: 21,
                },
              ],
            },
          ]);
        }, [setValue]);

        return (
          <div>
            {fields.map((item, i) => (
              <div key={item.id}>
                <label>
                  {`nest.${i}.value`}
                  <input {...register(`nest.${i}.value` as const)} />
                </label>

                <ChildComponent control={control} index={i} />
              </div>
            ))}
          </div>
        );
      };

      render(<Component />);

      const nestInput0 = screen.getByRole('textbox', {
        name: 'nest.0.value',
      });
      const nestInput1 = screen.getByRole('textbox', { name: 'nest.1.value' });
      const nestedArrayInput0 = screen.getByRole('textbox', {
        name: 'nest.0.nestedArray.0.value',
      });
      const nestedArrayInput1 = screen.getByRole('textbox', {
        name: 'nest.1.nestedArray.0.value',
      });

      expect(nestInput0).toHaveValue('1');
      expect(nestedArrayInput0).toHaveValue('11');
      expect(nestInput1).toHaveValue('2');
      expect(nestedArrayInput1).toHaveValue('21');
    });

    it('should populate all array fields correctly with setValue', () => {
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
              <label key={item.id}>
                {`nest.${index}.nestedArray.${i}.value`}
                <input
                  {...control.register(
                    `nest.${index}.nestedArray.${i}.value` as const,
                  )}
                />
              </label>
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
                    value: 11,
                  },
                ],
              },
              {
                value: 2,
                nestedArray: [
                  {
                    value: 21,
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
                <label>
                  {`nest.${i}.value`}
                  <input {...register(`nest.${i}.value` as const)} />
                </label>

                <ChildComponent control={control} index={i} />
              </div>
            ))}
          </div>
        );
      };

      render(<Component />);

      const nestInput0 = screen.getByRole('textbox', { name: 'nest.0.value' });
      const nestInput1 = screen.getByRole('textbox', { name: 'nest.1.value' });
      const nestedArrayInput0 = screen.getByRole('textbox', {
        name: 'nest.0.nestedArray.0.value',
      });
      const nestedArrayInput1 = screen.getByRole('textbox', {
        name: 'nest.1.nestedArray.0.value',
      });

      expect(nestInput0).toHaveValue('1');
      expect(nestedArrayInput0).toHaveValue('11');
      expect(nestInput1).toHaveValue('2');
      expect(nestedArrayInput1).toHaveValue('21');
    });

    it('should worked with deep nested field array without chaining useFieldArray', () => {
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
              <label key={item.id}>
                {`nest.${index}.nestedArray.deepNest.${i}.value`}
                <input
                  {...control.register(
                    `nest.${index}.nestedArray.deepNest.${i}.value` as const,
                  )}
                />
              </label>
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
                <label>
                  {`nest.${i}.value`}
                  <input {...register(`nest.${i}.value` as const)} />
                </label>
                <ChildComponent control={control} index={i} />
                <button
                  type={'button'}
                  onClick={() => {
                    setValue(
                      'nest',
                      [
                        {
                          value: 'newV1',
                          nestedArray: {
                            deepNest: [
                              {
                                value: 'new1',
                              },
                              {
                                value: 'new2',
                              },
                              {
                                value: 'new3',
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

      render(<Component />);

      expect(screen.getAllByRole('textbox')).toHaveLength(2);
      const nestInput = screen.getByRole('textbox', { name: 'nest.0.value' });
      const deepNestInput0 = screen.getByRole('textbox', {
        name: 'nest.0.nestedArray.deepNest.0.value',
      });

      expect(nestInput).toHaveValue('1');
      expect(deepNestInput0).toHaveValue('1');

      fireEvent.click(screen.getByRole('button', { name: 'setValue' }));

      const deepNestInput1 = screen.getByRole('textbox', {
        name: 'nest.0.nestedArray.deepNest.1.value',
      });
      const deepNestInput2 = screen.getByRole('textbox', {
        name: 'nest.0.nestedArray.deepNest.2.value',
      });

      expect(screen.getByRole('textbox', { name: 'nest.0.value' })).toHaveValue(
        'newV1',
      );
      expect(
        screen.getByRole('textbox', {
          name: 'nest.0.nestedArray.deepNest.0.value',
        }),
      ).toHaveValue('new1');
      expect(deepNestInput1).toHaveValue('new2');
      expect(deepNestInput2).toHaveValue('new3');

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      const deepNestInput3 = screen.getByRole('textbox', {
        name: 'nest.0.nestedArray.deepNest.3.value',
      });
      expect(deepNestInput3).toHaveValue('test');
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

      expect(watchValue.at(-1)).toEqual({ test: [] });

      fireEvent.click(screen.getByRole('button', { name: 'append' }));

      expect(watchValue.at(-1)).toEqual({
        test: [
          {
            yourDetails: {
              firstName: ['test', 'test1'],
              lastName: ['test', 'test1'],
            },
          },
        ],
      });

      fireEvent.click(screen.getByRole('button', { name: 'submit' }));

      expect(
        await screen.findByText(
          '{"test":[{"yourDetails":{"firstName":["test","test1"],"lastName":["test","test1"]}}]}',
        ),
      ).toBeVisible();

      // Let's check all values of renders with implicitly the number of render (for each value)
      expect(watchValue).toMatchSnapshot();
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

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() =>
        expect(submitData).toEqual({
          test: [],
        }),
      );
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
          test2: [],
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
                test2: [],
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
                test2: [],
              })
            }
          >
            insert
          </button>

          <button
            type={'button'}
            onClick={() =>
              append({
                test: 'append',
                test2: [
                  {
                    test: 'test',
                  },
                ],
                test1: '',
              })
            }
          >
            deep append
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
                test1: '',
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
                test1: '',
              })
            }
          >
            deep insert
          </button>
        </form>
      );
    };

    render(<Component />);

    expect(watchValues.at(-1)).toEqual([
      {
        test: 'append',
        test1: 'append',
        test2: [],
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'prepend' }));

    expect(watchValues.at(-1)).toEqual([
      { test: 'prepend', test1: 'prepend', test2: [] },
      {
        test: 'append',
        test1: 'append',
        test2: [],
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'insert' }));

    expect(watchValues.at(-1)).toEqual([
      { test: 'prepend', test1: 'prepend', test2: [] },
      {
        test: 'insert',
        test1: 'insert',
        test2: [],
      },
      {
        test: 'append',
        test1: 'append',
        test2: [],
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'deep append' }));

    expect(watchValues.at(-1)).toEqual([
      { test: 'prepend', test1: 'prepend', test2: [] },
      {
        test: 'insert',
        test1: 'insert',
        test2: [],
      },
      {
        test: 'append',
        test1: 'append',
        test2: [],
      },
      {
        test: 'append',
        test1: '',
        test2: [
          {
            test: 'test',
          },
        ],
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'deep prepend' }));

    expect(watchValues.at(-1)).toEqual([
      {
        test: 'prepend',
        test1: '',
        test2: [
          {
            test: 'test',
          },
        ],
      },
      { test: 'prepend', test1: 'prepend', test2: [] },
      {
        test: 'insert',
        test1: 'insert',
        test2: [],
      },
      {
        test: 'append',
        test1: 'append',
        test2: [],
      },
      {
        test: 'append',
        test1: '',
        test2: [
          {
            test: 'test',
          },
        ],
      },
    ]);

    fireEvent.click(screen.getByRole('button', { name: 'deep insert' }));

    expect(watchValues.at(-1)).toEqual([
      {
        test: 'prepend',
        test1: '',
        test2: [
          {
            test: 'test',
          },
        ],
      },
      {
        test: 'insert',
        test1: '',
        test2: [
          {
            test: 'test',
          },
        ],
      },
      { test: 'prepend', test1: 'prepend', test2: [] },
      {
        test: 'insert',
        test1: 'insert',
        test2: [],
      },
      {
        test: 'append',
        test1: 'append',
        test2: [],
      },
      {
        test: 'append',
        test1: '',
        test2: [
          {
            test: 'test',
          },
        ],
      },
    ]);

    // Let's check all values of renders with implicitly the number of render (for each value)
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

    expect(watchedValue.at(-1)).toEqual({
      test: [
        {
          value: 'data',
        },
      ],
    });

    fireEvent.click(screen.getByRole('button'));

    expect(watchedValue.at(-1)).toEqual({
      test: [
        {
          value: 'data',
        },
        { value: 'test' },
        { value: 'test1' },
      ],
    });

    // Let's check all values of renders with implicitly the number of render (for each value)
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

    expect(result.at(-1)).toEqual({
      names: [
        {
          name: 'will',
        },
        {
          name: 'Mike',
        },
      ],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Toggle hide' }));

    expect(screen.queryAllByRole('textbox')).toEqual([]);

    fireEvent.click(screen.getByRole('button', { name: 'Change value' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle hide' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    expect(result.at(-1)).toEqual({ names: [] });

    // Let's check all values of renders with implicitly the number of render (for each value)
    expect(result).toEqual([
      {
        names: [
          {
            name: 'will',
          },
          {
            name: 'Mike',
          },
        ],
      },
      {
        names: [
          {
            name: 'will',
          },
          {
            name: 'Mike',
          },
        ],
      },
      {
        names: [],
      },
      {
        names: [],
      },
      {
        names: [],
      },
    ]);
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

    expect(watchedValues.at(-1)).toEqual({
      test: [{ value: 'test' }, { value: 'test1' }],
    });

    fireEvent.click(screen.getByRole('button'));

    expect(watchedValues.at(-1)).toEqual({});

    // Let's check all values of renders with implicitly the number of render (for each value)
    expect(watchedValues).toEqual([
      {
        test: [
          {
            value: 'test',
          },
          {
            value: 'test1',
          },
        ],
      },
      {
        test: [
          {
            value: 'test',
          },
          {
            value: 'test1',
          },
        ],
      },
      {},
    ]);
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

    fireEvent.click(screen.getByRole('button', { name: 'show' }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'show' }));

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
          <form onSubmit={handleSubmit(noop)}>
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

    fireEvent.click(screen.getByRole('button', { name: 'Append' }));

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

    fireEvent.click(screen.getByRole('button', { name: 'swap' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'append' })[0]);

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

    expect(screen.getAllByRole('textbox').length).toEqual(6);

    fireEvent.click(screen.getByRole('button', { name: 'set' }));

    expect(screen.getAllByRole('textbox').length).toEqual(7);
    expect(
      (screen.getAllByRole('textbox')[6] as HTMLInputElement).value,
    ).toEqual('1sub-new');
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
                        id: '',
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

    fireEvent.click(screen.getAllByRole('button', { name: 'copy' })[0]);

    fireEvent.click(screen.getAllByRole('button', { name: 'remove' })[0]);

    expect(controlObj._fields.items.length).toEqual(2);
  });

  it('should avoid omit keyName when defaultValues contains keyName attribute', () => {
    let getValuesMethod: Function = noop;

    const App = () => {
      const { control, getValues } = useForm({
        defaultValues: {
          test: [{ id: '1234', test: 'data' }],
        },
      });

      getValuesMethod = getValues;

      useFieldArray({
        control,
        name: 'test',
      });

      return null;
    };

    render(<App />);

    expect(getValuesMethod()).toEqual({
      test: [{ id: '1234', test: 'data' }],
    });
  });

  describe('with rules', () => {
    it('should validate the minLength of the entire field array after submit and correct accordingly', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
        } = useForm({
          defaultValues: {
            test: [{ test: '' }],
          },
        });

        const { append } = useFieldArray({
          control,
          name: 'test',
          rules: {
            minLength: {
              value: 2,
              message: 'Min length should be 2',
            },
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
            <button
              type={'button'}
              onClick={() => {
                append({
                  test: '',
                });
              }}
            >
              append
            </button>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      screen.getByText('Min length should be 2');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      expect(screen.queryByAltText('Min length should be 2')).toBeNull();
    });

    it('should validate with custom validation after submit and correct accordingly', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
        } = useForm({
          defaultValues: {
            test: [{ test: '' }],
          },
        });

        const { append } = useFieldArray({
          control,
          name: 'test',
          rules: {
            validate: (values) => {
              if (Array.isArray(values) && values.length < 2) {
                return 'Min length should be 2';
              }

              return true;
            },
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
            <button
              type={'button'}
              onClick={() => {
                append({
                  test: '',
                });
              }}
            >
              append
            </button>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      screen.getByText('Min length should be 2');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      expect(screen.queryByAltText('Min length should be 2')).toBeNull();
    });

    it('should validate the maxLength of the entire field array after submit and correct accordingly', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
        } = useForm({
          defaultValues: {
            test: [{ test: '' }, { test: '' }, { test: '' }, { test: '' }],
          },
        });

        const { remove } = useFieldArray({
          control,
          name: 'test',
          rules: {
            maxLength: {
              value: 2,
              message: 'Max length should be 2',
            },
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
            <button
              type={'button'}
              onClick={() => {
                remove();
              }}
            >
              remove
            </button>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      screen.getByText('Max length should be 2');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'remove' }));
      });

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();
    });

    it('should respect the validation mode and trigger validation after each field array action', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
        } = useForm({
          defaultValues: {
            test: [{ test: '' }, { test: '' }, { test: '' }, { test: '' }],
          },
          mode: 'onChange',
        });

        const { remove, append } = useFieldArray({
          control,
          name: 'test',
          rules: {
            maxLength: {
              value: 2,
              message: 'Max length should be 2',
            },
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
            <button
              type={'button'}
              onClick={() => {
                remove();
              }}
            >
              remove
            </button>

            <button
              type={'button'}
              onClick={() => {
                append({
                  test: '',
                });
              }}
            >
              append
            </button>
          </form>
        );
      };

      render(<App />);

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      screen.getByText('Max length should be 2');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'remove' }));
      });

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();
    });

    it('should not conflict with field level error', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
          register,
        } = useForm({
          defaultValues: {
            test: [{ test: '' }, { test: '' }, { test: '' }, { test: '' }],
          },
          mode: 'onChange',
        });

        const { remove, append, fields } = useFieldArray({
          control,
          name: 'test',
          rules: {
            maxLength: {
              value: 2,
              message: 'Max length should be 2',
            },
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input
                    {...register(`test.${index}.test`, {
                      required: 'This is required',
                    })}
                  />
                  <p>{errors.test?.[index]?.test?.message}</p>
                </div>
              );
            })}
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
            <button
              type={'button'}
              onClick={() => {
                remove();
              }}
            >
              remove
            </button>

            <button
              type={'button'}
              onClick={() => {
                append({
                  test: '',
                });
              }}
            >
              append
            </button>
          </form>
        );
      };

      render(<App />);

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();
      expect(screen.queryByAltText('This is required')).toBeNull();

      await act(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[0], {
          target: {
            value: '1',
          },
        });
      });

      await act(async () => {
        fireEvent.change(screen.getAllByRole('textbox')[0], {
          target: {
            value: '',
          },
        });
      });

      screen.getByText('This is required');

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'remove' }));
      });

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();
    });

    it('should not throw error when required is not defined but minLength', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
          register,
        } = useForm<{ test: { test: string }[] }>({
          defaultValues: {
            test: [],
          },
        });

        const { fields } = useFieldArray({
          control,
          name: 'test',
          rules: {
            maxLength: {
              value: 2,
              message: 'Max length should be 2',
            },
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input
                    {...register(`test.${index}.test`, {
                      required: 'This is required',
                    })}
                  />
                  <p>{errors.test?.[index]?.test?.message}</p>
                </div>
              );
            })}
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByAltText('Max length should be 2')).toBeNull();
    });

    it('should throw error when required is defined', async () => {
      const App = () => {
        const {
          control,
          handleSubmit,
          formState: { errors },
          register,
        } = useForm<{ test: { test: string }[] }>({
          defaultValues: {
            test: [],
          },
        });

        const { fields } = useFieldArray({
          control,
          name: 'test',
          rules: {
            required: 'Please enter some data',
          },
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <input
                    {...register(`test.${index}.test`, {
                      required: 'This is required',
                    })}
                  />
                  <p>{errors.test?.[index]?.test?.message}</p>
                </div>
              );
            })}
            <p>{errors.test?.root?.message}</p>
            <button>submit</button>
          </form>
        );
      };

      render(<App />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });

      expect(screen.queryByAltText('Please enter some data')).toBeNull();
    });
  });

  describe('with nested field array ', () => {
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
      const { fields, append } = useFieldArray({
        name: `fieldArray.${arrayIndex}.nestedFieldArray` as const,
        control,
        rules: {
          required: 'This is required',
          minLength: {
            value: 3,
            message: 'Min length of 3',
          },
        },
      });

      return (
        <div>
          {fields.map((nestedField, index) => (
            <div key={nestedField.id}>
              <input
                {...register(
                  `fieldArray.${arrayIndex}.nestedFieldArray.${index}.value` as const,
                )}
              />
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

    it('should report field array error at the nested useFieldArray level when form submitted', async () => {
      const Component = () => {
        const {
          register,
          control,
          handleSubmit,
          formState: { errors },
        } = useForm<FormValues>();
        const { fields, append } = useFieldArray({
          name: 'fieldArray',
          control,
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <ArrayField
                    arrayIndex={index}
                    arrayField={field}
                    register={register}
                    control={control}
                  />
                  <p>
                    {errors?.fieldArray?.[0]?.nestedFieldArray?.root?.message}
                  </p>
                </div>
              );
            })}
            <button
              onClick={() =>
                append({
                  value: '',
                  nestedFieldArray: [],
                })
              }
              type={'button'}
            >
              append
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'submit' }));
      });

      screen.getByText('This is required');
    });

    it('should report field array error at the nested useFieldArray level during field level action', async () => {
      const Component = () => {
        const {
          register,
          control,
          handleSubmit,
          formState: { errors },
        } = useForm<FormValues>({
          mode: 'onChange',
        });
        const { fields, append } = useFieldArray({
          name: 'fieldArray',
          control,
        });

        return (
          <form onSubmit={handleSubmit(noop)}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <ArrayField
                    arrayIndex={index}
                    arrayField={field}
                    register={register}
                    control={control}
                  />
                  <p>
                    {errors?.fieldArray?.[0]?.nestedFieldArray?.root?.message}
                  </p>
                </div>
              );
            })}
            <button
              onClick={() =>
                append({
                  value: '',
                  nestedFieldArray: [],
                })
              }
              type={'button'}
            >
              append
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'append' }));
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: 'Add nested array' }),
        );
      });

      screen.getByText('Min length of 3');
    });
  });

  it('should update isValid correctly with rules props and inline validation', async () => {
    const App = () => {
      const {
        control,
        register,
        formState: { isValid },
      } = useForm({
        defaultValues: {
          test: [{ value: '1' }],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'test',
        rules: {
          required: true,
        },
      });

      return (
        <div>
          {fields.map((field, index) => (
            <input
              key={field.id}
              {...register(`test.${index}.value`, { required: true })}
            />
          ))}

          <button
            onClick={() =>
              append({
                value: '',
              })
            }
          >
            Append
          </button>

          <p>{isValid ? 'valid' : 'invalid'}</p>
        </div>
      );
    };

    render(<App />);

    await waitFor(() => {
      screen.getByText('valid');
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      screen.getByText('invalid');
    });
  });

  describe('with formState observers', () => {
    it('should trigger reRender when user subscribes to root formState', async () => {
      type FormValues = { test: { value: string }[] };

      const FieldArray = ({
        register,
        control,
      }: {
        register: UseFormRegister<FormValues>;
        control: Control<FormValues>;
      }) => {
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
          </>
        );
      };

      let renderCount = 0;
      const Component = () => {
        const { register, control, formState } = useForm<FormValues>();

        formState.isDirty;
        formState.dirtyFields;
        formState.errors;

        renderCount++;

        return (
          <form>
            <FieldArray register={register} control={control} />
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      await waitFor(() => expect(renderCount).toEqual(2));
    });

    it('should trigger reRender on components that subscribe to useFieldArray fieldState', async () => {
      type FormValues = { test: { value: string }[] };
      let rootRenderCount = 0;
      let observerRenderCount = 0;

      const FieldArray = ({
        register,
        control,
      }: {
        register: UseFormRegister<FormValues>;
        control: Control<FormValues>;
      }) => {
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
          </>
        );
      };

      const Observer = ({ control }: { control: Control<FormValues> }) => {
        const { isDirty, dirtyFields, errors } = useFormState({
          name: 'test',
          control,
        });

        observerRenderCount++;

        return <p>{JSON.stringify({ isDirty, dirtyFields, errors })}</p>;
      };

      const Component = () => {
        const { register, control } = useForm<FormValues>();

        rootRenderCount++;

        return (
          <form>
            <FieldArray register={register} control={control} />
            <Observer control={control} />
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      await waitFor(() => {
        expect(rootRenderCount).toEqual(1);
        expect(observerRenderCount).toEqual(2);
      });
    });

    it('should unmount field array and remove its reference with shouldUnregister: true', () => {
      type FormValues = {
        type: string;
        array: {
          data: string;
        }[];
      };

      let array: { data: string }[] = [];

      function FieldArray({ control }: { control: Control<FormValues> }) {
        useFieldArray({
          name: 'array' as const,
          control,
          shouldUnregister: true,
        });
        return null;
      }

      function App() {
        const methods = useForm({
          defaultValues: {
            type: 'NO_CART',
            array: [],
          },
          shouldUnregister: true,
        });
        const [toggle, setToggle] = useState(false);
        const { control, watch } = methods;
        array = watch('array');

        return (
          <>
            <button onClick={() => setToggle(!toggle)} />
            <form>{toggle && <FieldArray control={control} />}</form>
          </>
        );
      }

      render(<App />);

      fireEvent.click(screen.getByRole('button'));

      expect(array).toEqual([]);

      fireEvent.click(screen.getByRole('button'));

      expect(array).toBeUndefined();
    });

    it('should not trigger reRender on components that do not subscribe to useFieldArray fieldState', async () => {
      type FormValues = { test: { value: string }[]; other: string };
      let rootRenderCount = 0;
      let notObserverRenderCount = 0;

      const FieldArray = ({
        register,
        control,
      }: {
        register: UseFormRegister<FormValues>;
        control: Control<FormValues>;
      }) => {
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <>
            {fields.map((field, i) => (
              <input key={field.id} {...register(`test.${i}.value` as const)} />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
          </>
        );
      };

      const NotObserver = ({ control }: { control: Control<FormValues> }) => {
        const { isDirty, dirtyFields, errors } = useFormState({
          name: 'other',
          control,
        });

        notObserverRenderCount++;

        return <p>{JSON.stringify({ isDirty, dirtyFields, errors })}</p>;
      };

      const Component = () => {
        const { register, control } = useForm<FormValues>();

        rootRenderCount++;

        return (
          <form>
            <FieldArray register={register} control={control} />
            <NotObserver control={control} />
            <input {...register('other')} />
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      expect(rootRenderCount).toEqual(1);
      expect(notObserverRenderCount).toEqual(1);
    });
  });
});
