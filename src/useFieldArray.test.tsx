/* eslint-disable no-console */
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
import { reconfigureControl } from './__mocks__/reconfigureControl';
import { useForm } from './useForm';
import { DeepMap } from './types/utils';
import * as generateId from './logic/generateId';
import { Control, ValidationRules, FieldError } from './types';
import { VALIDATION_MODE } from './constants';

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

describe('useFieldArray', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  afterEach(() => {
    // @ts-ignore
    generateId.default.mockRestore();
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

    it.each(['test', 'test[0].value'])(
      'should output error message when registered field name is %s in development environment',
      (name) => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const env = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const Component = () => {
          const { register, control } = useForm();
          const { fields, append } = useFieldArray({ name, control });

          return (
            <form>
              {fields.map((field, i) => (
                <input
                  key={field.id}
                  name={`${name}[${i}]`}
                  type="text"
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

        expect(console.warn).toBeCalledTimes(1);

        process.env.NODE_ENV = env;

        // @ts-ignore
        console.warn.mockRestore();
      },
    );

    it.each([
      ['test', 'key'],
      ['test[0].values', 'key'],
    ])(
      'should not output error message when registered field name is %s in development environment',
      (name, key) => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const env = process.env.NODE_ENV;
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
                  type="text"
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

        process.env.NODE_ENV = env;

        // @ts-ignore
        console.warn.mockRestore();
      },
    );

    it('should not output error message when registered field name is flat array in production environment', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});

      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const Component = () => {
        const { register, control } = useForm();
        const { fields, append } = useFieldArray({ name: 'test', control });

        return (
          <form>
            {fields.map((field, i) => (
              <input
                key={field.id}
                name={`test[${i}]`}
                type="text"
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

      process.env.NODE_ENV = env;

      // @ts-ignore
      console.warn.mockRestore();
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
        { id: '0', value: 'default' },
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

          // call isDirty or dirtyFields
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

          // call isDirty or dirtyFields
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

        expect(formState.dirtyFields).toEqual({});
        expect(formState.isDirty).toBeFalsy();
      },
    );
  });

  describe('append', () => {
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

    it.each(['isDirty', 'dirtyFields'])(
      'should be dirty when value is appended with %s',
      (property) => {
        const { result } = renderHook(() => {
          const { register, formState, control } = useForm();
          const { fields, append } = useFieldArray({
            control,
            name: 'test',
          });

          return { register, formState, fields, append };
        });

        (result.current.formState as Record<string, any>)[property];

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
                type="text"
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
                type="text"
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
                  type="text"
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
      (property) => {
        const { result } = renderHook(() => {
          const { register, formState, control } = useForm();
          const { fields, prepend } = useFieldArray({
            control,
            name: 'test',
          });

          return { register, formState, fields, prepend };
        });

        (result.current.formState as Record<string, any>)[property];

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
                type="text"
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
                type="text"
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
                type="text"
                name={`test[${i}].value`}
                ref={register()}
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
                  type="text"
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
                type="text"
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
                type="text"
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

      // @ts-ignore
      HTMLInputElement.prototype.removeEventListener.mockRestore();
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

            <button type={'button'} onClick={() => append({})}>
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
      (property) => {
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

        (result.current.formState as Record<string, any>)[property];

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
        expect(result.current.formState.dirtyFields).toEqual({});
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
                type="text"
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

      expect(touched).toEqual({
        test: [],
      });
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
                type="text"
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
                type="text"
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
                type="text"
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
        register: (rules?: ValidationRules) => (ref: HTMLInputElement) => void;
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
                type="text"
                name={`test[${i}].value`}
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
                <input type="text" name={`test[${i}].value`} ref={register()} />
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
  });

  describe('insert', () => {
    it('should insert data at index', () => {
      const dirtyFieldsRef = {
        current: {
          test: [
            {
              test: 1,
            },
            {
              test1: 1,
            },
            {
              test2: 1,
            },
          ],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
            readFormStateRef: {
              current: {
                dirtyFields: true,
              },
            } as any,
            dirtyFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.insert(1, { test: '3' });
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: '1' },
        { id: '2', test: '3' },
        { id: '1', test: '2' },
      ]);

      act(() => {
        result.current.insert(1, [{ test: '4' }, { test: '5' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: '1' },
        { id: '5', test: '4' },
        { id: '6', test: '5' },
        { id: '2', test: '3' },
        { id: '1', test: '2' },
      ]);
      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test: 1,
          },
          { test: true },
          { test: true },
          { test: true },
          {
            test1: 1,
          },
          {
            test2: 1,
          },
        ],
      });
    });

    it('should insert touched fields', () => {
      const touchedFieldsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };
      const { result } = renderHook(() =>
        useFieldArray({
          control: {
            ...reconfigureControl(),
            readFormStateRef: {
              current: {
                touched: true,
              },
            } as any,
            touchedFieldsRef: touchedFieldsRef as any,
            fieldsRef: {
              current: {
                'test[0]': {
                  ref: {
                    value: 1,
                    name: 'test[0]',
                  },
                },
                'test[1]': {
                  ref: {
                    value: 2,
                    name: 'test[1]',
                  },
                },
                'test[2]': {
                  ref: {
                    value: 3,
                    name: 'test[2]',
                  },
                },
              },
            } as any,
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.insert(1, { test: 'test2' });
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [{ test: '1' }, undefined, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.insert(1, [{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [
            { test: '1' },
            undefined,
            undefined,
            undefined,
            { test: '2' },
            { test: '3' },
          ],
        },
      });
    });

    it('should insert error', () => {
      const errorsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };
      const { result } = renderHook(() =>
        useFieldArray({
          control: {
            ...reconfigureControl(),
            errorsRef: errorsRef as any,
            fieldsRef: {
              current: {
                'test[0]': {
                  ref: {
                    value: 1,
                    name: 'test[0]',
                  },
                },
                'test[1]': {
                  ref: {
                    value: 2,
                    name: 'test[1]',
                  },
                },
                'test[2]': {
                  ref: {
                    value: 3,
                    name: 'test[2]',
                  },
                },
              },
            } as any,
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.insert(1, { test: 'test2' });
      });

      expect(errorsRef).toEqual({
        current: {
          test: [{ test: '1' }, undefined, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.insert(1, [{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(errorsRef).toEqual({
        current: {
          test: [
            { test: '1' },
            undefined,
            undefined,
            undefined,
            { test: '2' },
            { test: '3' },
          ],
        },
      });
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            isWatchAllRef: {
              current: true,
            },
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.insert(1, { test: 'test' });
      });

      expect(result.current.fields).toEqual([
        { id: '0', test: '1' },
        { id: '2', test: 'test' },
        { id: '1', test: '2' },
      ]);
      expect(reRender).toBeCalledTimes(2);
    });

    it('should focus if shouldFocus is true', () => {
      const mockFocus = jest.fn();

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': {
                  ref: {
                    name: 'test[0]',
                    value: { test: '1' },
                    focus: mockFocus,
                  },
                },
                'test[1]': {
                  ref: {
                    name: 'test[1]',
                    value: { test: 'test' },
                    focus: mockFocus,
                  },
                },
                'test[2]': {
                  ref: {
                    name: 'test[2]',
                    value: { test: '2' },
                    focus: mockFocus,
                  },
                },
              },
            },
          }),
          name: 'test',
        }),
      );

      act(() => result.current.insert(1, { test: 'test' }));

      expect(result.current.fields).toEqual([
        { id: '0', test: '1' },
        { id: '2', test: 'test' },
        { id: '1', test: '2' },
      ]);
      expect(mockFocus).toBeCalledTimes(1);
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
                  type="text"
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
  });

  describe('swap', () => {
    it('should swap data order', () => {
      const dirtyFieldsRef = {
        current: {
          test: [
            {
              test: 1,
            },
            {
              test1: 1,
            },
            {
              test2: 1,
            },
          ],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
            readFormStateRef: {
              current: {
                dirtyFields: true,
              },
            } as any,
            dirtyFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.swap(0, 1);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '2' },
        { id: '0', test: '1' },
      ]);

      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test1: 1,
          },
          {
            test: 1,
          },
          {
            test2: 1,
          },
        ],
      });
    });

    it('should swap errors', () => {
      const errorsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            errorsRef: errorsRef as any,
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.swap(0, 1);
      });

      expect(errorsRef.current).toEqual({
        test: [{ test: '2' }, { test: '1' }, { test: '3' }],
      });
    });

    it('should swap touched fields', () => {
      const touchedFieldsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            readFormStateRef: {
              current: {
                touched: true,
              },
            } as any,
            touchedFieldsRef: touchedFieldsRef as any,
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.swap(0, 1);
      });

      expect(touchedFieldsRef.current).toEqual({
        test: [{ test: '2' }, { test: '1' }, { test: '3' }],
      });
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            isWatchAllRef: {
              current: true,
            },
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
            getValues: () => ({ test: [{}, {}] }),
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.swap(0, 1);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '2' },
        { id: '0', test: '1' },
      ]);

      expect(reRender).toBeCalledTimes(2);
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
                  type="text"
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
  });

  describe('move', () => {
    it('should move into pointed position', () => {
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(2, 0);
      });

      expect(result.current.fields).toEqual([
        { id: '2', test: '3' },
        { id: '0', test: '1' },
        { id: '1', test: '2' },
      ]);
    });

    it('should move dirtyFields', () => {
      const dirtyFieldsRef = {
        current: {
          test: [
            {
              test: true,
            },
            {
              test: true,
            },
            {
              test: true,
            },
          ],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            readFormStateRef: {
              current: {
                dirtyFields: true,
              },
            } as any,
            dirtyFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(2, 0);
      });

      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test: true,
          },
          {
            test: true,
          },
          {
            test: true,
          },
        ],
      });
    });

    it('should move dirtyFields when there are many more fields than dirtyFields', () => {
      const dirtyFieldsRef = {
        current: {
          test: [
            {
              test: true,
            },
          ],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            readFormStateRef: {
              current: {
                dirtyFields: true,
              },
            } as any,
            dirtyFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(0, 1);
      });

      expect(dirtyFieldsRef.current).toEqual({
        test: [
          undefined,
          {
            test: true,
          },
        ],
      });
    });

    it('should move errors', () => {
      const errorsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            errorsRef: errorsRef as any,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(2, 0);
      });

      expect(errorsRef.current).toEqual({
        test: [{ test: '3' }, { test: '1' }, { test: '2' }],
      });
    });

    it('should move errors when there are many more fields than errors', () => {
      const errorsRef = {
        current: {
          test: [{ test: '1' }],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            errorsRef: errorsRef as any,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(0, 1);
      });

      expect(errorsRef.current).toEqual({
        test: [undefined, { test: '1' }],
      });
    });

    it('should move touched fields', () => {
      const touchedFieldsRef = {
        current: {
          test: [{ test: true }, { test: true }, { test: true }],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            readFormStateRef: {
              current: {
                touched: true,
              },
            } as any,
            touchedFieldsRef: touchedFieldsRef as any,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(2, 0);
      });

      expect(touchedFieldsRef.current).toEqual({
        test: [{ test: true }, { test: true }, { test: true }],
      });
    });

    it('should move touched fields when there are many more fields than touchedFields', () => {
      const touchedFieldsRef = {
        current: {
          test: [{ test: true }],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            readFormStateRef: {
              current: {
                touched: true,
              },
            } as any,
            touchedFieldsRef: touchedFieldsRef as any,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(0, 1);
      });

      expect(touchedFieldsRef.current).toEqual({
        test: [undefined, { test: true }],
      });
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            isWatchAllRef: {
              current: true,
            },
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
              },
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(0, 1);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '2' },
        { id: '0', test: '1' },
      ]);
      expect(reRender).toBeCalledTimes(2);
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
                  type="text"
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
  });

  describe('setFieldAndValidState', () => {
    let renderCount = 0;
    let Component: React.FC<{ control: Control<Record<string, any>> }>;
    beforeEach(() => {
      renderCount = 0;
      Component = ({ control }: { control: Control<Record<string, any>> }) => {
        const { append } = useFieldArray({
          name: 'test',
          control,
        });
        renderCount++;
        return (
          <div>
            <button onClick={() => append({ test: 'value' })}></button>
          </div>
        );
      };
    });

    afterEach(() => {
      expect(renderCount).toBe(2);
    });

    it('should call validateSchemaIsValid method', () => {
      const mockControl = reconfigureControl();

      const { container } = render(
        <Component
          control={{
            ...mockControl,
            readFormStateRef: {
              current: {
                ...mockControl.readFormStateRef.current,
                isValid: true,
              },
            },
          }}
        />,
      );

      fireEvent.click(container.querySelector('button')!);

      expect(mockControl.validateSchemaIsValid).toBeCalledWith({
        test: [{ id: '0', test: 'value' }],
      });
    });

    it('should not call validateSchemaIsValid method if isValid is false', () => {
      const mockControl = reconfigureControl();

      const { container } = render(<Component control={mockControl} />);

      fireEvent.click(container.querySelector('button')!);

      expect(mockControl.validateSchemaIsValid).not.toBeCalled();
    });

    it('should not call validateSchemaIsValid method if validateSchemaIsValid is undefined', () => {
      const mockControl = reconfigureControl();

      const { container } = render(
        <Component
          control={{
            ...mockControl,
            readFormStateRef: {
              current: {
                ...mockControl.readFormStateRef.current,
                isValid: true,
              },
            },
            validateSchemaIsValid: undefined,
          }}
        />,
      );

      fireEvent.click(container.querySelector('button')!);

      expect(mockControl.validateSchemaIsValid).not.toBeCalled();
    });
  });

  describe('array of array fields', () => {
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
                placeholder="type"
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
              <div key={item.value}>
                <input
                  name={`nest.test[${i}].value`}
                  ref={register()}
                  defaultValue={item.value}
                  placeholder="type"
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

      await actComponent(async () => {
        fireEvent.click(screen.getByTestId('1'));
      });

      expect(screen.getAllByPlaceholderText('type').length).toBe(2);

      await actComponent(async () => {
        fireEvent.click(screen.getByRole('button', { name: /append/i }));
      });

      expect(screen.getAllByPlaceholderText('type').length).toBe(3);
    });
  });
});
