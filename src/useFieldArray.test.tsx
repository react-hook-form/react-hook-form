import * as React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act as actComponent,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';
import { useForm } from './useForm';
import * as generateId from './logic/generateId';
import { Controller } from './controller';
import { VALIDATION_MODE } from './constants';
import { FormProvider } from './useFormContext';
import {
  Control,
  RegisterOptions,
  FieldError,
  DeepMap,
  SubmitHandler,
  UseFormMethods,
  FieldValues,
} from './types';

let nodeEnv: string | undefined;

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

describe('useFieldArray', () => {
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

  describe('initialize', () => {
    it('should return default fields value', () => {
      const { result } = renderHook(() => {
        const { control } = useForm();
        return useFieldArray({
          control: control,
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
          test: string[];
        }>({
          shouldUnregister: false,
        });
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
                  name={`test[${i}].value`}
                  ref={register()}
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
          errors,
          formState: { isValid },
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
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => append({})}>
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

  describe('error handling', () => {
    it('should output error message when name is empty string in development mode', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'development';

      renderHook(() => {
        const { control } = useForm();
        useFieldArray({ control, name: '' });
      });

      expect(console.warn).toBeCalledTimes(1);
    });

    it('should not output error message when name is empty string in production mode', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'production';

      renderHook(() => {
        const { control } = useForm();
        useFieldArray({ control, name: '' });
      });

      expect(console.warn).not.toBeCalled();
    });

    it('should output error message when a conflicting fieldArray keyName is found in the fieldValues in development mode', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'development';

      renderHook(() => {
        const { control } = useForm({
          defaultValues: {
            test: [{ id: '123' }],
          },
        });
        useFieldArray({ control, name: 'test' });
      });

      expect(console.warn).toBeCalledTimes(1);
    });

    it('should not output error message when a conflicting fieldArray keyName is found in the fieldValues in production mode', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'production';

      renderHook(() => {
        const { control } = useForm({
          defaultValues: {
            test: [{ id: '123' }],
          },
        });
        useFieldArray({ control, name: 'test' });
      });

      expect(console.warn).toBeCalledTimes(0);
    });

    it('should throw custom error when control is not defined in development mode', () => {
      process.env.NODE_ENV = 'development';

      const { result } = renderHook(() => useFieldArray({ name: 'test' }));

      expect(result.error.message).toBe(
        '📋 useFieldArray is missing `control` prop. https://react-hook-form.com/api#useFieldArray',
      );
    });

    it('should throw TypeError when control is not defined in production mode', () => {
      process.env.NODE_ENV = 'production';

      const { result } = renderHook(() => useFieldArray({ name: 'test' }));

      expect(result.error.name).toBe(new TypeError().name);
    });

    it.each(['test', 'test[0].value'])(
      'should output error message when registered field name is %s in development environment',
      (name) => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'development';

        const Component = () => {
          const { register, control } = useForm();
          const { fields, append } = useFieldArray({ name, control });

          return (
            <form>
              {fields.map((field, i) => (
                <input key={field.id} name={`${name}[${i}]`} ref={register()} />
              ))}
              <button type="button" onClick={() => append({})}>
                append
              </button>
            </form>
          );
        };

        render(<Component />);

        fireEvent.click(screen.getByRole('button', { name: /append/i }));

        expect(console.warn).toBeCalledTimes(1);
      },
    );

    it.each([
      ['test', 'key'],
      ['test[0].values', 'key'],
    ])(
      'should not output error message when registered field name is %s in development environment',
      (name, key) => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        process.env.NODE_ENV = 'development';

        const Component = () => {
          const { register, control } = useForm();
          const { fields, append } = useFieldArray({ name, control });

          return (
            <form>
              {fields.map((field, i) => (
                <input
                  key={field.id}
                  name={`${name}[${i}].${key}`}
                  ref={register()}
                />
              ))}
              <button type="button" onClick={() => append({})}>
                append
              </button>
            </form>
          );
        };

        render(<Component />);

        fireEvent.click(screen.getByRole('button', { name: /append/i }));

        expect(console.warn).not.toBeCalled();
      },
    );

    it('should not output error message when registered field name is flat array in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { register, control } = useForm();
        const { fields, append } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input key={field.id} name={`test[${i}]`} ref={register()} />
            ))}
            <button type="button" onClick={() => append({})}>
              append
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      expect(console.warn).not.toBeCalled();
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
            <input name="data" ref={register} defaultValue="test" />
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register}
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
        test: [{ id: '0', value: '' }],
      });
    });

    it('should provide correct form data with nested field array', async () => {
      let formData: any = {};
      const Nested = ({
        index,
        control,
      }: {
        control: Control;
        index: number;
      }) => {
        const { fields, append } = useFieldArray({
          name: `test[${index}].nestedArray`,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                name={`test[${index}].nestedArray[${i}].value`}
                ref={control.register()}
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
        } = useForm<{
          test: {
            value: string;
            nestedArray: {
              value: string;
            }[];
          }[];
        }>({
          resolver: (data) => {
            formData = data;
            return {
              values: data,
              errors: {},
            };
          },
          mode: 'onChange',
          shouldUnregister: false,
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
                  name={`test[${i}].value`}
                  ref={register()}
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
            nestedArray: [
              { id: '1', value: '2' },
              { id: '2', value: 'test' },
            ],
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
    it('should call removeFieldEventListenerAndRef when field variable is array', () => {
      let getValues: any;
      const Component = () => {
        const { register, control, getValues: tempGetValues } = useForm();
        const { fields, append } = useFieldArray({ name: 'test', control });
        getValues = tempGetValues;

        return (
          <div>
            {fields.map((_, i) => (
              <input
                key={i.toString()}
                name={`test[${i}].value`}
                ref={register}
              />
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

      expect(getValues()).toEqual({});
    });

    it('should remove reset method when field array is unmouned', () => {
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
      input.removeEventListener = jest.fn();

      result.current.register()(input);

      act(() => {
        result.current.append({ value: 'test' });
      });

      unmount();

      expect(result.current.fields).toEqual([
        { id: '0', value: '' },
        { id: '1', value: 'test' },
      ]);
      expect(input.removeEventListener).toHaveBeenCalled();
      expect(result.current.control.fieldArrayNamesRef.current).toEqual(
        new Set(),
      );
      expect(result.current.control.resetFieldArrayFunctionRef.current).toEqual(
        {},
      );
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
              <input
                key={i.toString()}
                name={`test[${i}].value`}
                ref={register}
              />
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

      result.current.register({ type: 'text', name: 'test[0].value' });

      act(() => {
        result.current.reset();
      });

      expect(result.current.fields).toEqual([{ id: '3', value: 'default' }]);
    });

    it('should reset with field array with shouldUnregister set to false', () => {
      const { result } = renderHook(() => {
        const { register, reset, control } = useForm({
          defaultValues: {
            test: [{ value: 'default' }],
          },
          shouldUnregister: false,
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

      result.current.register({ type: 'text', name: 'test[0].value' });

      act(() => {
        result.current.reset();
      });

      expect(result.current.fields).toEqual([{ id: '3', value: 'default' }]);

      act(() => {
        result.current.reset({
          test: [{ value: 'data' }],
        });
      });

      expect(result.current.fields).toEqual([{ id: '5', value: 'data' }]);
    });

    it('should reset with async', async () => {
      const Nested = ({
        index,
        control,
      }: {
        control: Control;
        index: number;
      }) => {
        const { fields } = useFieldArray({
          name: `test[${index}].nestedArray`,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                name={`test[${index}].nestedArray[${i}].value`}
                ref={control.register()}
                defaultValue={item.value}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, reset, control } = useForm();
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
                  name={`test[${i}].value`}
                  ref={register()}
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
                  name={`test[${i}].name`}
                  key={i.toString()}
                  ref={register()}
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

        expect(formState.dirtyFields).toEqual({
          test: [{ name: true }],
        });
        expect(formState.isDirty).toBeTruthy();
      },
    );

    it.each(['isDirty', 'dirtyFields'])(
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
                  name={`test[${i}].name`}
                  key={i.toString()}
                  ref={register()}
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

        expect(formState.dirtyFields).toEqual({
          test: [{ name: true }],
        });
        expect(formState.isDirty).toBeTruthy();

        actComponent(() => {
          setValue(
            'test',
            [{ name: 'default' }, { name: 'default1' }, { name: 'default2' }],
            { shouldDirty: true },
          );
        });

        expect(formState.dirtyFields).toEqual({
          test: [],
        });
        expect(formState.isDirty).toBeFalsy();
      },
    );

    it('should set nested field array correctly', () => {
      function NestedArray({
        control,
        name,
      }: {
        control: Control;
        name: string;
      }) {
        const { fields } = useFieldArray({ name, control });

        return (
          <ul>
            {fields.map((item, index) => (
              <Controller
                key={item.id}
                as={<input aria-label={'name'} />}
                name={`${name}[${index}].name`}
                control={control}
                defaultValue={item.name}
              />
            ))}
          </ul>
        );
      }

      function Component() {
        const { register, control, setValue } = useForm({
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
                    name={`test[${index}].firstName`}
                    aria-label={`test[${index}].firstName`}
                    defaultValue={`${item.firstName}`}
                    ref={register()}
                  />
                  <NestedArray
                    control={control}
                    name={`test[${index}].keyValue`}
                  />
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setValue('test[0].keyValue', [{ name: '2a' }])}
            >
              setValue
            </button>
          </form>
        );
      }

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'setValue' }));

      const input = screen.getByLabelText('name') as HTMLInputElement;

      expect(input.value).toEqual('2a');

      expect(
        (screen.getByLabelText('test[0].firstName') as HTMLInputElement).value,
      ).toEqual('Bill');
    });
  });

  describe('append', () => {
    it('should append dirty fields correctly', async () => {
      let dirtyInputs = {};
      const Component = () => {
        const {
          register,
          control,
          formState: { dirtyFields },
        } = useForm<{
          test: { value: string }[];
        }>({
          defaultValues: {
            test: [
              { value: 'plz change' },
              { value: 'dont change' },
              { value: 'dont change' },
            ],
          },
        });
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        dirtyInputs = dirtyFields;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            {dirtyFields.test?.length && 'dirty'}
          </form>
        );
      };

      render(<Component />);

      fireEvent.input(screen.getAllByRole('textbox')[0], {
        target: { value: 'test' },
      });
      fireEvent.blur(screen.getAllByRole('textbox')[0]);

      await waitFor(() => screen.getByText('dirty'));

      expect(dirtyInputs).toEqual({
        test: [{ value: true }],
      });

      fireEvent.click(screen.getByRole('button'));

      expect(dirtyInputs).toEqual({
        test: [{ value: true }, undefined, undefined, { value: true }],
      });
    });

    it('should append data into the fields', () => {
      const { result } = renderHook(() => {
        const { register, control } = useForm();
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        return { register, fields, append };
      });

      act(() => {
        result.current.append({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '0', test: 'test' }]);

      act(() => {
        result.current.append({ test: 'test1' });
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: 'test' },
        { id: '1', test: 'test1' },
      ]);

      act(() => {
        result.current.append({});
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: 'test' },
        { id: '1', test: 'test1' },
        { id: '2' },
      ]);

      act(() => {
        result.current.append([{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: 'test' },
        { id: '1', test: 'test1' },
        { id: '2' },
        { id: '3', test: 'test2' },
        { id: '4', test: 'test3' },
      ]);
    });

    it('should update shallowFieldsStateRef during append action', async () => {
      const { result } = renderHook(() => {
        const { register, control } = useForm({
          shouldUnregister: false,
        });
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });

        return { register, fields, append, control };
      });

      act(() => {
        result.current.append({ data: 'test' });
      });

      expect(result.current.control.shallowFieldsStateRef.current).toEqual({
        test: [{ data: 'test' }],
      });
    });

    it.each(['isDirty', 'dirtyFields'])(
      'should be dirty when value is appended with %s',
      () => {
        const { result } = renderHook(() => {
          const { register, formState, control } = useForm();
          const { fields, append } = useFieldArray({
            control,
            name: 'test',
          });

          return { register, formState, fields, append };
        });

        result.current.formState.isDirty;
        result.current.formState.dirtyFields;

        act(() => {
          result.current.append({ value: 'test' });
        });

        act(() => {
          result.current.append({ value: 'test1' });
        });

        act(() => {
          result.current.append({ value: 'test2' });
        });

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: [{ value: true }, { value: true }, { value: true }],
        });
      },
    );

    it('should trigger reRender when user is watching the all field array', () => {
      const watched: any[] = [];
      const Component = () => {
        const { register, watch, control } = useForm();
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });
        watched.push(watch());

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      expect(watched).toEqual([
        {}, // first render
        {}, // render inside useEffect in useFieldArray
        {}, // render inside append method
        { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
      ]);
    });

    it('should focus if shouldFocus is true', () => {
      const Component = () => {
        const { register, control } = useForm({
          defaultValues: { test: [{ value: '1' }, { value: '2' }] },
        });
        const { fields, append } = useFieldArray({ control, name: 'test' });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '3' })}>
              append
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(document.activeElement).toEqual(inputs[2]);
    });

    it('should not focus if shouldFocus is false', () => {
      const Component = () => {
        const { register, control } = useForm({
          defaultValues: { test: [{ value: '1' }, { value: '2' }] },
        });
        const { fields, append } = useFieldArray({ control, name: 'test' });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '3' }, false)}>
              append
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(document.activeElement).toEqual(document.body);
    });

    it('should return watched value with watch API', async () => {
      const renderedItems: any = [];
      const Component = () => {
        const { watch, register, control } = useForm();
        const { fields, append } = useFieldArray({
          name: 'test',
          control,
        });
        const watched = watch('test', fields);
        renderedItems.push(watched);
        return (
          <div>
            {fields.map((field, i) => (
              <div key={`${field.id}`}>
                <input
                  name={`test[${i}].value`}
                  defaultValue={field.value}
                  ref={register()}
                />
              </div>
            ))}
            <button onClick={() => append({ value: 'test' })}>append</button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      await waitFor(() =>
        expect(renderedItems).toEqual([
          [],
          [],
          [{ id: '0', value: 'test' }],
          [{ value: 'test' }],
        ]),
      );
    });

    describe('with resolver', () => {
      it('should invoke resolver when formState.isValid true', async () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
          });
          const { append } = useFieldArray({ control, name: 'test' });
          return { formState, append };
        });

        result.current.formState.isValid;

        await act(async () => {
          result.current.append({ value: '1' });
        });

        expect(resolver).toBeCalledWith(
          {
            test: [{ id: '0', value: '1' }],
          },
          undefined,
          false,
        );
      });

      it('should not invoke resolver when formState.isValid false', () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
          });
          const { append } = useFieldArray({ control, name: 'test' });
          return { formState, append };
        });

        act(() => {
          result.current.append({ value: '1' });
        });

        expect(resolver).not.toBeCalled();
      });
    });
  });

  describe('prepend', () => {
    it('should pre-append data into the fields', () => {
      const { result } = renderHook(() => {
        const { control, formState } = useForm();
        const { fields, prepend } = useFieldArray({
          control,
          name: 'test',
        });

        return { formState, fields, prepend };
      });

      act(() => {
        result.current.prepend({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '0', test: 'test' }]);

      act(() => {
        result.current.prepend({ test: 'test1' });
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: 'test1' },
        { id: '0', test: 'test' },
      ]);

      act(() => {
        result.current.prepend({});
      });

      expect(result.current.fields).toEqual([
        { id: '2' },
        { id: '1', test: 'test1' },
        { id: '0', test: 'test' },
      ]);

      act(() => {
        result.current.prepend([{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '3', test: 'test2' },
        { id: '4', test: 'test3' },
        { id: '2' },
        { id: '1', test: 'test1' },
        { id: '0', test: 'test' },
      ]);
    });

    it.each(['isDirty', 'dirtyFields'])(
      'should be dirty when value is prepended with %s',
      () => {
        const { result } = renderHook(() => {
          const { register, formState, control } = useForm();
          const { fields, prepend } = useFieldArray({
            control,
            name: 'test',
          });

          return { register, formState, fields, prepend };
        });

        result.current.formState.isDirty;
        result.current.formState.dirtyFields;

        act(() => {
          result.current.prepend({ value: 'test' });
        });

        act(() => {
          result.current.prepend({ value: 'test1' });
        });

        act(() => {
          result.current.prepend({ value: 'test2' });
        });

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: [{ value: true }, { value: true }, { value: true }],
        });
      },
    );

    it('should set prepended values to formState.touched', () => {
      let touched: any;

      const Component = () => {
        const { register, formState, control } = useForm();
        const { fields, prepend } = useFieldArray({
          control,
          name: 'test',
        });

        touched = formState.touched;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button
              type="button"
              onClick={() => prepend({ value: `test${1}` })}
            >
              prepend
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      fireEvent.blur(screen.getAllByRole('textbox')[0]);

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));
      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      expect(touched).toEqual({
        test: [undefined, { value: true }, { value: true }],
      });
    });

    it('should prepend error', async () => {
      let errors: any;
      const Component = () => {
        const {
          register,
          errors: tempErrors,
          handleSubmit,
          control,
        } = useForm();
        const { fields, prepend } = useFieldArray({
          control,
          name: 'test',
        });
        errors = tempErrors;

        return (
          <form onSubmit={handleSubmit(() => {})}>
            {fields.map((field, i) => (
              <input
                key={field.id}
                ref={register({ required: true })}
                name={`test[${i}].value`}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => prepend({ value: '' })}>
              prepend
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      expect(errors.test).toBeUndefined();

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      expect(errors.test).toHaveLength(2);
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const watched: any[] = [];
      const Component = () => {
        const { register, watch, control } = useForm();
        const { fields, prepend } = useFieldArray({
          control,
          name: 'test',
        });
        watched.push(watch());

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => prepend({ value: '' })}>
              prepend
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'prepend' }));

      expect(watched).toEqual([
        {}, // first render
        {}, // render inside useEffect in useFieldArray
        {}, // render inside prepend method
        { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
      ]);
    });

    it('should return watched value with watch API', async () => {
      const renderedItems: any = [];
      const Component = () => {
        const { watch, register, control } = useForm();
        const { fields, append, prepend } = useFieldArray({
          name: 'test',
          control,
        });
        const watched = watch('test', fields);
        const isPrepended = React.useRef(false);
        if (isPrepended.current) {
          renderedItems.push(watched);
        }
        return (
          <div>
            {fields.map((field, i) => (
              <div key={`${field.id}`}>
                <input
                  name={`test[${i}].value`}
                  defaultValue={field.value}
                  ref={register()}
                />
              </div>
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <button
              onClick={() => {
                prepend({ value: 'test' });
                isPrepended.current = true;
              }}
            >
              prepend
            </button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      const inputs = screen.getAllByRole('textbox');

      fireEvent.input(inputs[0], {
        target: { name: 'test[0].value', value: '111' },
      });
      fireEvent.input(inputs[1], {
        target: { name: 'test[1].value', value: '222' },
      });

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      await waitFor(() =>
        expect(renderedItems).toEqual([
          [
            { id: '2', value: 'test' },
            { id: '0', value: '111' },
            { id: '1', value: '222' },
          ],
          [{ value: 'test' }, { value: '111' }, { value: '222' }],
        ]),
      );
    });

    it('should focus if shouldFocus is true', () => {
      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, prepend } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => prepend({ value: '' })}>
              prepend
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(document.activeElement).toEqual(inputs[0]);
    });

    it('should not focus if shouldFocus is false', () => {
      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, prepend } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => prepend({ value: '' }, false)}>
              prepend
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(document.activeElement).toEqual(document.body);
    });

    it('should remove event listener', () => {
      jest.spyOn(HTMLInputElement.prototype, 'removeEventListener');

      const Component = () => {
        const { register, control } = useForm();
        const { fields, append, prepend } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => append({ value: `test${1}` })}>
              append
            </button>
            <button
              type="button"
              onClick={() => prepend({ value: `test${1}` })}
            >
              prepend
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

      expect(
        HTMLInputElement.prototype.removeEventListener,
      ).toHaveBeenCalledTimes(6);
    });

    describe('with resolver', () => {
      it('should invoke resolver when formState.isValid true', async () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
          });
          const { prepend } = useFieldArray({ control, name: 'test' });
          return { formState, prepend };
        });

        result.current.formState.isValid;

        await act(async () => {
          result.current.prepend({ value: '1' });
        });

        expect(resolver).toBeCalledWith(
          {
            test: [{ id: '0', value: '1' }],
          },
          undefined,
          false,
        );
      });

      it('should not invoke resolver when formState.isValid false', () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
          });
          const { prepend } = useFieldArray({ control, name: 'test' });
          return { formState, prepend };
        });

        act(() => {
          result.current.prepend({ value: '1' });
        });

        expect(resolver).not.toBeCalled();
      });
    });
  });

  describe('remove', () => {
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
                  name={`test[${i}].name`}
                  ref={register()}
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
                  name={`test[${i}].name`}
                  ref={register({ required: true })}
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
      'should be dirty when value is remove with %s',
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

    it('should remove values from formState.touched', () => {
      let touched: any;

      const Component = () => {
        const { register, formState, control } = useForm();
        const { fields, append, remove } = useFieldArray({
          control,
          name: 'test',
        });

        touched = formState.touched;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
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
                ref={register({ required: true })}
                name={`test[${i}].value`}
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

      /**
       * we should not enter value to the second input field.
       * Because we have checked if valid field move to removed field position or not.
       *
       * await actComponent(async () => {
       *   fireEvent.input(inputs[1], {
       *     target: { value: 'test' },
       *   });
       * });
       */

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
                ref={register({ required: true })}
                name={`test[${i}].value`}
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
          errors: tempErrors,
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
                name={`test[${i}].value`}
                ref={register({ required: true })}
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
      let mockKey = 0;
      const Nested = ({
        register,
        errors,
        control,
        index,
      }: {
        register: (rules?: RegisterOptions) => (ref: HTMLInputElement) => void;
        control: Control;
        errors: DeepMap<Record<string, any>, FieldError>;
        index: number;
      }) => {
        const { fields, append, remove } = useFieldArray({
          name: `test[${index}].nested`,
          control,
        });
        return (
          <fieldset>
            {fields.map((field, i) => (
              <div key={field.id}>
                <input
                  name={`test[${index}].nested[${i}].test`}
                  ref={register({ required: 'required' })}
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
        const { register, errors, handleSubmit, control } = useForm({
          defaultValues: {
            test: [{ nested: [{ test: '', key: mockKey }] as any }],
          },
        });
        const { fields } = useFieldArray({ name: 'test', control });
        return (
          <form onSubmit={handleSubmit(callback)}>
            {fields.map((_, i) => (
              <Nested
                key={i.toString()}
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
        const { register, watch, control } = useForm();
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
                name={`test[${i}].value`}
                defaultValue={field.value}
                ref={register()}
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
        {}, // render inside append method
        { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
        {}, // render inside remove method
        {}, // render inside useEffect in useFieldArray
      ]);
    });

    it('should return watched value with watch API', async () => {
      const renderedItems: any = [];
      const Component = () => {
        const { watch, register, control } = useForm();
        const { fields, append, remove } = useFieldArray({
          name: 'test',
          control,
        });
        const watched = watch('test', fields);
        const isRemoved = React.useRef(false);
        if (isRemoved.current) {
          renderedItems.push(watched);
        }
        return (
          <div>
            {fields.map((field, i) => (
              <div key={`${field.id}`}>
                <input name={`test[${i}].value`} ref={register()} />
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

      fireEvent.input(inputs[0], {
        target: { name: 'test[0].value', value: '111' },
      });
      fireEvent.input(inputs[1], {
        target: { name: 'test[1].value', value: '222' },
      });
      fireEvent.input(inputs[2], {
        target: { name: 'test[2].value', value: '333' },
      });

      fireEvent.click(screen.getByRole('button', { name: /remove/i }));

      await waitFor(() =>
        expect(renderedItems).toEqual([
          [
            { id: '0', value: '111' },
            { id: '1', value: '222' },
          ],
          [{ value: '111' }, { value: '222' }],
        ]),
      );
    });

    it('should remove event listener', () => {
      jest.spyOn(HTMLInputElement.prototype, 'removeEventListener');

      const Component = () => {
        const { register, control } = useForm({
          defaultValues: { test: [{ value: 'test' }] },
        });
        const { fields, remove } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => remove(0)}>
              remove
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /remove/i }));

      expect(
        HTMLInputElement.prototype.removeEventListener,
      ).toHaveBeenCalledTimes(3);
    });

    it('should remove dirty fields with nested field inputs', () => {
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
        const { control, handleSubmit } = useForm({
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
                      as={<input />}
                      name={`test[${index}].firstName`}
                      control={control}
                      defaultValue={item.firstName} // make sure to set up defaultValue
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
                      name={`test[${index}].lastName`}
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
          false,
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

  describe('insert', () => {
    it('should insert data at index with single value', () => {
      const { result } = renderHook(() => {
        const { control } = useForm({
          defaultValues: {
            test: [{ test: '1' }, { test: '2' }],
          },
        });
        const { fields, insert } = useFieldArray({
          control,
          name: 'test',
        });
        return { fields, insert };
      });

      act(() => {
        result.current.insert(1, { test: '3' });
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: '1' },
        { id: '2', test: '3' },
        { id: '1', test: '2' },
      ]);
    });

    it('should insert data at index with array value', () => {
      const { result } = renderHook(() => {
        const { control } = useForm({
          defaultValues: {
            test: [{ test: '1' }, { test: '2' }],
          },
        });
        const { fields, insert } = useFieldArray({
          control,
          name: 'test',
        });
        return { fields, insert };
      });

      act(() => {
        result.current.insert(1, [{ test: '3' }, { test: '4' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: '1' },
        { id: '2', test: '3' },
        { id: '3', test: '4' },
        { id: '1', test: '2' },
      ]);
    });

    it.each(['isDirty', 'dirtyFields'])(
      'should insert data to formState.%s at index with single value',
      () => {
        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            defaultValues: { test: [{ value: '1' }] },
          });
          const { fields, append, insert } = useFieldArray({
            control,
            name: 'test',
          });

          return { formState, fields, append, insert };
        });

        result.current.formState.isDirty;
        result.current.formState.dirtyFields;

        act(() => {
          result.current.append({ value: '2' });
          result.current.insert(1, { value1: '3' });
        });

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: [undefined, { value: true, value1: true }, { value: true }],
        });
      },
    );

    it.each(['isDirty', 'dirtyFields'])(
      'should insert data to formState.%s at index with array value',
      () => {
        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            defaultValues: { test: [{ value: '1' }] },
          });
          const { fields, append, insert } = useFieldArray({
            control,
            name: 'test',
          });

          return { formState, fields, append, insert };
        });

        result.current.formState.isDirty;
        result.current.formState.dirtyFields;

        act(() => {
          result.current.append({ value: '2' });
          result.current.insert(1, [{ value1: '3' }, { value2: '4' }]);
        });

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: [
            undefined,
            { value1: true, value: true },
            { value2: true, value: true },
            { value: true },
          ],
        });
      },
    );

    it('should insert touched fields with single value', () => {
      let touched: any;
      const Component = () => {
        const { register, formState, control } = useForm({
          defaultValues: { test: [{ value: '1' }, { value: '2' }] },
        });
        const { fields, insert } = useFieldArray({
          control,
          name: 'test',
        });

        touched = formState.touched;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                defaultValue={field.value}
                ref={register()}
              />
            ))}
            <button
              type="button"
              onClick={() => insert(1, { value: `${fields.length}` })}
            >
              insert
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.blur(screen.getAllByRole('textbox')[0]);
      fireEvent.blur(screen.getAllByRole('textbox')[1]);

      fireEvent.click(screen.getByRole('button', { name: /insert/i }));

      expect(touched).toEqual({
        test: [{ value: true }, undefined, { value: true }],
      });
    });

    it('should insert touched fields with array value', () => {
      let touched: any;
      const Component = () => {
        const { register, formState, control } = useForm({
          defaultValues: { test: [{ value: '1' }, { value: '2' }] },
        });
        const { fields, insert } = useFieldArray({
          control,
          name: 'test',
        });

        touched = formState.touched;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                defaultValue={field.value}
                ref={register()}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                insert(1, [
                  { value: `${fields.length}` },
                  { value: `${fields.length + 1}` },
                ])
              }
            >
              insert array
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.blur(screen.getAllByRole('textbox')[0]);
      fireEvent.blur(screen.getAllByRole('textbox')[1]);

      fireEvent.click(screen.getByRole('button', { name: /insert array/i }));

      expect(touched).toEqual({
        test: [{ value: true }, undefined, undefined, { value: true }],
      });
    });

    it('should insert error with single value', async () => {
      let errors: any;
      const Component = () => {
        const { register, handleSubmit, control, ...rest } = useForm();
        const { fields, append, insert } = useFieldArray({
          control,
          name: 'test',
        });

        errors = rest.errors;

        return (
          <form onSubmit={handleSubmit(() => {})}>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register({ required: true })}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => insert(1, { value: '' })}>
              insert
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      fireEvent.click(screen.getByRole('button', { name: /insert/i }));

      expect(errors.test[0]).toBeDefined();
      expect(errors.test[1]).toBeUndefined();
      expect(errors.test[2]).toBeDefined();
    });

    it('should insert error with array value', async () => {
      let errors: any;
      const Component = () => {
        const { register, handleSubmit, control, ...rest } = useForm();
        const { fields, append, insert } = useFieldArray({
          control,
          name: 'test',
        });

        errors = rest.errors;

        return (
          <form onSubmit={handleSubmit(() => {})}>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register({ required: true })}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button
              type="button"
              onClick={() => insert(1, [{ value: '' }, { value: '' }])}
            >
              insert array
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      fireEvent.click(screen.getByRole('button', { name: /insert array/i }));

      expect(errors.test[0]).toBeDefined();
      expect(errors.test[1]).toBeUndefined();
      expect(errors.test[2]).toBeUndefined();
      expect(errors.test[3]).toBeDefined();
    });

    it('should focus if shouldFocus is true', () => {
      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, insert } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => insert(1, { value: '' })}>
              insert
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /insert/i }));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(document.activeElement).toEqual(inputs[1]);
    });

    it('should not focus if shouldFocus is false', () => {
      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, insert } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button
              type="button"
              onClick={() => insert(1, { value: '' }, false)}
            >
              insert
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /insert/i }));

      const inputs = screen.getAllByRole('textbox');

      expect(inputs).toHaveLength(3);
      expect(document.activeElement).toEqual(document.body);
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const watched: any[] = [];
      const Component = () => {
        const { register, watch, control } = useForm();
        const { fields, insert } = useFieldArray({
          control,
          name: 'test',
        });
        watched.push(watch());

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                defaultValue={field.value}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => insert(0, { value: '' })}>
              insert
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'insert' }));

      expect(watched).toEqual([
        {}, // first render
        {}, // render inside useEffect in useFieldArray
        {}, // render inside insert method
        { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
      ]);
    });

    it('should return watched value with watch API', async () => {
      const renderedItems: any = [];
      const Component = () => {
        const { watch, register, control } = useForm();
        const { fields, append, insert } = useFieldArray({
          name: 'test',
          control,
        });
        const watched = watch('test', fields);
        const isInserted = React.useRef(false);
        if (isInserted.current) {
          renderedItems.push(watched);
        }
        return (
          <div>
            {fields.map((field, i) => (
              <div key={`${field.id}`}>
                <input
                  name={`test[${i}].value`}
                  defaultValue={field.value}
                  ref={register()}
                />
              </div>
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <button
              onClick={() => {
                insert(1, { value: 'test' });
                isInserted.current = true;
              }}
            >
              insert
            </button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      const inputs = screen.getAllByRole('textbox');

      fireEvent.input(inputs[0], {
        target: { name: 'test[0].value', value: '111' },
      });
      fireEvent.input(inputs[1], {
        target: { name: 'test[1].value', value: '222' },
      });

      fireEvent.click(screen.getByRole('button', { name: /insert/i }));

      await waitFor(() =>
        expect(renderedItems).toEqual([
          [
            { id: '0', value: '111' },
            { id: '2', value: 'test' },
            { id: '1', value: '222' },
          ],
          [{ value: '111' }, { value: 'test' }, { value: '222' }],
        ]),
      );
    });

    it('should remove event listener', () => {
      jest.spyOn(HTMLInputElement.prototype, 'removeEventListener');

      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }],
          },
        });
        const { fields, insert } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button
              type="button"
              onClick={() => insert(1, { value: `test${1}` })}
            >
              insert
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /insert/i }));

      expect(
        HTMLInputElement.prototype.removeEventListener,
      ).toHaveBeenCalledTimes(3);
    });

    describe('with resolver', () => {
      it('should invoke resolver when formState.isValid true', async () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
          });
          const { insert } = useFieldArray({ control, name: 'test' });
          return { formState, insert };
        });

        result.current.formState.isValid;

        await act(async () => {
          result.current.insert(0, { value: '1' });
        });

        expect(resolver).toBeCalledWith(
          {
            test: [{ id: '0', value: '1' }],
          },
          undefined,
          false,
        );
      });

      it('should not invoke resolver when formState.isValid false', () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
          });
          const { insert } = useFieldArray({ control, name: 'test' });
          return { formState, insert };
        });

        act(() => {
          result.current.insert(0, { value: '1' });
        });

        expect(resolver).not.toBeCalled();
      });
    });
  });

  describe('swap', () => {
    it('should swap data order', () => {
      const { result } = renderHook(() => {
        const { register, control } = useForm({
          defaultValues: { test: [{ value: '1' }] },
        });
        const methods = useFieldArray({
          control,
          name: 'test',
        });

        return { register, ...methods };
      });

      act(() => {
        result.current.append({ value: '2' });
      });

      act(() => {
        result.current.swap(0, 1);
      });

      expect(result.current.fields).toEqual([
        { id: '1', value: '2' },
        { id: '0', value: '1' },
      ]);
    });

    it.each(['isDirty', 'dirtyFields'])(
      'should swap dirty order when formState.%s is defined',
      () => {
        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            defaultValues: { test: [{ value: '1' }] },
          });
          const methods = useFieldArray({
            control,
            name: 'test',
          });
          return {
            formState,
            ...methods,
          };
        });

        result.current.formState.isDirty;
        result.current.formState.dirtyFields;

        act(() => {
          result.current.append({ value: '2' });
        });

        act(() => {
          result.current.append({ value: '3' });
        });

        act(() => {
          result.current.swap(0, 1);
        });

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: [{ value: true }, { value: true }, { value: true }],
        });
      },
    );

    it('should swap errors', async () => {
      let errors: any;
      const Component = () => {
        const { register, handleSubmit, control, ...rest } = useForm({
          defaultValues: { test: [{ value: 'test' }] },
        });
        const { fields, append, swap } = useFieldArray({
          control,
          name: 'test',
        });
        errors = rest.errors;

        return (
          <form onSubmit={handleSubmit(() => {})}>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register({ required: true })}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => swap(0, 1)}>
              swap
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      expect(errors.test[0]).toBeUndefined();
      expect(errors.test[1]).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /swap/i }));

      expect(errors.test[0]).toBeDefined();
      expect(errors.test[1]).toBeUndefined();
    });

    it('should swap touched fields', async () => {
      let touched: any;
      const Component = () => {
        const { register, formState, control } = useForm({
          defaultValues: { test: [{ value: 'test' }] },
        });
        const { fields, append, swap } = useFieldArray({
          control,
          name: 'test',
        });

        touched = formState.touched;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => swap(0, 1)}>
              swap
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      fireEvent.blur(screen.getAllByRole('textbox')[0]);

      fireEvent.click(screen.getByRole('button', { name: /swap/i }));

      expect(touched).toEqual({
        test: [undefined, { value: true }],
      });
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const watched: any[] = [];
      const Component = () => {
        const { register, watch, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, swap } = useFieldArray({
          control,
          name: 'test',
        });
        watched.push(watch());

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                defaultValue={field.value}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => swap(0, 1)}>
              swap
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'swap' }));

      expect(watched).toEqual([
        { test: [{ value: '1' }, { value: '2' }] }, // first render
        { test: [{ value: '1' }, { value: '2' }] }, // render inside useEffect in useFieldArray
        { test: [{ value: '1' }, { value: '2' }] }, // render inside swap method
        { test: [{ value: '2' }, { value: '1' }] }, // render inside useEffect in useFieldArray
      ]);
    });

    it('should return watched value with watch API', async () => {
      const renderedItems: any = [];
      const Component = () => {
        const { watch, register, control } = useForm();
        const { fields, append, swap } = useFieldArray({
          name: 'test',
          control,
        });
        const watched = watch('test', fields);
        const isSwapped = React.useRef(false);
        if (isSwapped.current) {
          renderedItems.push(watched);
        }
        return (
          <div>
            {fields.map((field, i) => (
              <div key={`${field.id}`}>
                <input
                  name={`test[${i}].value`}
                  defaultValue={field.value}
                  ref={register()}
                />
              </div>
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <button
              onClick={() => {
                swap(0, 1);
                isSwapped.current = true;
              }}
            >
              swap
            </button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      const inputs = screen.getAllByRole('textbox');

      fireEvent.input(inputs[0], {
        target: { name: 'test[0].value', value: '111' },
      });
      fireEvent.input(inputs[1], {
        target: { name: 'test[1].value', value: '222' },
      });

      fireEvent.click(screen.getByRole('button', { name: /swap/i }));

      await waitFor(() =>
        expect(renderedItems).toEqual([
          [
            { id: '1', value: '222' },
            { id: '0', value: '111' },
          ],
          [{ value: '222' }, { value: '111' }],
        ]),
      );
    });

    it('should remove event listener', () => {
      jest.spyOn(HTMLInputElement.prototype, 'removeEventListener');

      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, swap } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => swap(0, 1)}>
              swap
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /swap/i }));

      expect(
        HTMLInputElement.prototype.removeEventListener,
      ).toHaveBeenCalledTimes(6);
    });

    describe('with resolver', () => {
      it('should invoke resolver when formState.isValid true', async () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
            defaultValues: {
              test: [{ value: '1' }, { value: '2' }],
            },
          });
          const { swap } = useFieldArray({ control, name: 'test' });
          return { formState, swap };
        });

        result.current.formState.isValid;

        await act(async () => {
          result.current.swap(0, 1);
        });

        expect(resolver).toBeCalledWith(
          {
            test: [
              { id: '1', value: '2' },
              { id: '0', value: '1' },
            ],
          },
          undefined,
          false,
        );
      });

      it('should not invoke resolver when formState.isValid false', () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
            defaultValues: {
              test: [{ value: '1' }, { value: '2' }],
            },
          });
          const { swap } = useFieldArray({ control, name: 'test' });
          return { formState, swap };
        });

        act(() => {
          result.current.swap(0, 1);
        });

        expect(resolver).not.toBeCalled();
      });
    });
  });

  describe('move', () => {
    it('should move into pointed position', () => {
      const { result } = renderHook(() => {
        const { register, control } = useForm({
          defaultValues: { test: [{ value: '1' }] },
        });
        const methods = useFieldArray({
          control,
          name: 'test',
        });

        return { register, ...methods };
      });

      act(() => {
        result.current.append({ value: '2' });
      });

      act(() => {
        result.current.swap(0, 1);
      });

      expect(result.current.fields).toEqual([
        { id: '1', value: '2' },
        { id: '0', value: '1' },
      ]);
    });

    it.each(['isDirty', 'dirtyFields'])(
      'should move dirty into pointed position when formState.%s is defined',
      () => {
        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            defaultValues: { test: [{ value: '1' }] },
          });
          const methods = useFieldArray({
            control,
            name: 'test',
          });
          return {
            formState,
            ...methods,
          };
        });

        result.current.formState.isDirty;
        result.current.formState.dirtyFields;

        act(() => {
          result.current.append({ value: '2' });
        });

        act(() => {
          result.current.append({ value: '3' });
        });

        act(() => {
          result.current.move(0, 1);
        });

        expect(result.current.formState.isDirty).toBeTruthy();
        expect(result.current.formState.dirtyFields).toEqual({
          test: [{ value: true }, { value: true }, { value: true }],
        });
      },
    );

    it('should move errors', async () => {
      let errors: any;
      const Component = () => {
        const { register, handleSubmit, control, ...rest } = useForm({
          defaultValues: { test: [{ value: 'test' }] },
        });
        const { fields, append, move } = useFieldArray({
          control,
          name: 'test',
        });
        errors = rest.errors;

        return (
          <form onSubmit={handleSubmit(() => {})}>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register({ required: true })}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => move(0, 1)}>
              move
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: /submit/i }));
      });

      expect(errors.test[0]).toBeUndefined();
      expect(errors.test[1]).toBeDefined();

      fireEvent.click(screen.getByRole('button', { name: /move/i }));

      expect(errors.test[0]).toBeDefined();
      expect(errors.test[1]).toBeUndefined();
    });

    it('should move touched fields', async () => {
      let touched: any;
      const Component = () => {
        const { register, formState, control } = useForm({
          defaultValues: { test: [{ value: 'test' }] },
        });
        const { fields, append, move } = useFieldArray({
          control,
          name: 'test',
        });

        touched = formState.touched;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
            <button type="button" onClick={() => append({ value: '' })}>
              append
            </button>
            <button type="button" onClick={() => move(0, 1)}>
              move
            </button>
            <button>submit</button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      fireEvent.blur(screen.getAllByRole('textbox')[0]);

      fireEvent.click(screen.getByRole('button', { name: /move/i }));

      expect(touched).toEqual({
        test: [undefined, { value: true }],
      });
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const watched: any[] = [];
      const Component = () => {
        const { register, watch, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, move } = useFieldArray({
          control,
          name: 'test',
        });
        watched.push(watch());

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                defaultValue={field.value}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => move(0, 1)}>
              move
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: 'move' }));

      expect(watched).toEqual([
        { test: [{ value: '1' }, { value: '2' }] }, // first render
        { test: [{ value: '1' }, { value: '2' }] }, // render inside useEffect in useFieldArray
        { test: [{ value: '1' }, { value: '2' }] }, // render inside move method
        { test: [{ value: '2' }, { value: '1' }] }, // render inside useEffect in useFieldArray
      ]);
    });

    it('should populate all fields with default values', () => {
      let getValues: any;
      const Component = () => {
        const { register, control, getValues: tempGetValues } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields } = useFieldArray({
          control,
          name: 'test',
        });
        getValues = tempGetValues;

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
                defaultValue={field.value}
              />
            ))}
          </form>
        );
      };

      render(<Component />);

      expect(getValues()).toEqual({ test: [{ value: '1' }, { value: '2' }] });
    });

    it('should return watched value with watch API', async () => {
      const renderedItems: any = [];
      const Component = () => {
        const { watch, register, control } = useForm();
        const { fields, append, move } = useFieldArray({
          name: 'test',
          control,
        });
        const watched = watch('test', fields);
        const isMoved = React.useRef(false);
        if (isMoved.current) {
          renderedItems.push(watched);
        }
        return (
          <div>
            {fields.map((field, i) => (
              <div key={`${field.id}`}>
                <input
                  name={`test[${i}].value`}
                  defaultValue={field.value}
                  ref={register()}
                />
              </div>
            ))}
            <button onClick={() => append({ value: '' })}>append</button>
            <button
              onClick={() => {
                move(0, 1);
                isMoved.current = true;
              }}
            >
              move
            </button>
          </div>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));
      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      const inputs = screen.getAllByRole('textbox');

      fireEvent.input(inputs[0], {
        target: { name: 'test[0].value', value: '111' },
      });
      fireEvent.input(inputs[1], {
        target: { name: 'test[1].value', value: '222' },
      });

      fireEvent.click(screen.getByRole('button', { name: /move/i }));

      await waitFor(() =>
        expect(renderedItems).toEqual([
          [
            { id: '1', value: '222' },
            { id: '0', value: '111' },
          ],
          [{ value: '222' }, { value: '111' }],
        ]),
      );
    });

    it('should remove event listener', () => {
      jest.spyOn(HTMLInputElement.prototype, 'removeEventListener');

      const Component = () => {
        const { register, control } = useForm({
          defaultValues: {
            test: [{ value: '1' }, { value: '2' }],
          },
        });
        const { fields, move } = useFieldArray({
          control,
          name: 'test',
        });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
            ))}
            <button type="button" onClick={() => move(0, 1)}>
              move
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /move/i }));

      expect(
        HTMLInputElement.prototype.removeEventListener,
      ).toHaveBeenCalledTimes(6);
    });

    describe('with resolver', () => {
      it('should invoke resolver when formState.isValid true', async () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
            defaultValues: {
              test: [{ value: '1' }, { value: '2' }],
            },
          });
          const { move } = useFieldArray({ control, name: 'test' });
          return { formState, move };
        });

        result.current.formState.isValid;

        await act(async () => {
          result.current.move(0, 1);
        });

        expect(resolver).toBeCalledWith(
          {
            test: [
              { id: '1', value: '2' },
              { id: '0', value: '1' },
            ],
          },
          undefined,
          false,
        );
      });

      it('should not invoke resolver when formState.isValid false', () => {
        const resolver = jest.fn().mockReturnValue({});

        const { result } = renderHook(() => {
          const { formState, control } = useForm({
            mode: VALIDATION_MODE.onChange,
            resolver,
            defaultValues: {
              test: [{ value: '1' }, { value: '2' }],
            },
          });
          const { move } = useFieldArray({ control, name: 'test' });
          return { formState, move };
        });

        act(() => {
          result.current.move(0, 1);
        });

        expect(resolver).not.toBeCalled();
      });
    });
  });

  describe('array of array fields', () => {
    it('should remove correctly with nested field array and set shouldUnregister to false', () => {
      const Component = () => {
        const { register, control } = useForm({
          shouldUnregister: false,
        });
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

      const ArrayField = ({
        arrayIndex,
        arrayField,
        register,
        control,
      }: {
        arrayIndex: number;
        register: UseFormMethods['register'];
        arrayField: Partial<FieldValues>;
        control: Control;
      }) => {
        const { fields, append, remove } = useFieldArray({
          name: `fieldArray[${arrayIndex}].nestedFieldArray`,
          control,
        });

        return (
          <div>
            <input
              ref={register}
              name={`fieldArray[${arrayIndex}].value`}
              defaultValue={arrayField.value}
            />
            <br />
            {fields.map((nestedField, index) => (
              <div key={nestedField.id}>
                <input
                  ref={register()}
                  name={`fieldArray[${arrayIndex}].nestedFieldArray[${index}].value`}
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
                  value: `fieldArray[${arrayIndex}].nestedFieldArray[${fields.length}].value`,
                });
              }}
            >
              Add nested array
            </button>
          </div>
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
      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control;
        index: number;
      }) => {
        const { fields } = useFieldArray({
          name: `nest.test[${index}].nestedArray`,
          control,
        });

        return (
          <>
            {fields.map((item, i) => (
              <input
                key={item.id}
                name={`nest.test[${index}].nestedArray[${i}].value`}
                ref={control.register()}
                defaultValue={item.value}
              />
            ))}
          </>
        );
      };

      const Component = () => {
        const { register, control } = useForm({
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
                  name={`nest[${i}].value`}
                  ref={register()}
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

      // @ts-ignore
      expect(screen.getAllByRole('textbox')[0].value).toEqual('test');
    });

    it('should render correct amount of child array fields', async () => {
      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control;
        index: number;
      }) => {
        const { fields } = useFieldArray({
          name: `nest.test[${index}].nestedArray`,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                name={`nest.test[${index}].nestedArray[${i}].value`}
                ref={control.register()}
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
                  name={`nest.test[${i}].value`}
                  ref={register()}
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
      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control;
        index: number;
      }) => {
        const { fields } = useFieldArray({
          name: `nest[${index}].nestedArray`,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                name={`nest[${index}].nestedArray[${i}].value`}
                ref={control.register()}
                defaultValue={item.value}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, control, setValue } = useForm();
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
                  name={`nest[${i}].value`}
                  ref={register()}
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
      const ChildComponent = ({
        index,
        control,
      }: {
        control: Control;
        index: number;
      }) => {
        const { fields } = useFieldArray({
          name: `nest[${index}].nestedArray`,
          control,
        });

        return (
          <div>
            {fields.map((item, i) => (
              <input
                key={item.id}
                name={`nest[${index}].nestedArray[${i}].value`}
                ref={control.register()}
                defaultValue={item.value}
              />
            ))}
          </div>
        );
      };

      const Component = () => {
        const { register, control, setValue } = useForm();
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
                  name={`nest[${i}].value`}
                  ref={register()}
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
  });

  describe('submit form', () => {
    it('should leave defaultValues as empty array when shouldUnregister set to false', async () => {
      let submitData: any;
      type FormValues = { test: string[] };
      const Component = () => {
        const { register, control, handleSubmit } = useForm<FormValues>({
          defaultValues: {
            test: [],
          },
          shouldUnregister: false,
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
              <input
                key={field.id}
                name={`test[${i}].value`}
                ref={register()}
              />
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
