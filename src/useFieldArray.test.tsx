import * as React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';
import { reconfigureControl } from './__mocks__/reconfigureControl';
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act as actComponent,
} from '@testing-library/react';
import { Control, ValidationRules, FieldError } from './types';
import { useForm } from './useForm';
import { DeepMap } from './types/utils';
import * as generateId from './logic/generateId';

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
      input.name = 'test[0]';
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

      result.current.register({ type: 'text', name: 'test[0]' });

      act(() => {
        result.current.append({ value: 'test' });
      });

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
      let watched: any;
      const Component = () => {
        const { register, watch, control } = useForm();
        const { fields, append } = useFieldArray({
          control,
          name: 'test',
        });
        watched = watch();

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
            <button type="button" onClick={() => append({ value: 'test' })}>
              append
            </button>
          </form>
        );
      };

      render(<Component />);

      fireEvent.click(screen.getByRole('button', { name: /append/i }));

      expect(watched).toEqual({ test: [{ value: 'test' }] });
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

    it('should prepend error', () => {
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
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.prepend({ test: 'test2' });
      });

      expect(errorsRef).toEqual({
        current: {
          test: [undefined, { test: '1' }, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.prepend([{ test: 'test1' }, { test: 'test3' }]);
      });

      expect(errorsRef).toEqual({
        current: {
          test: [
            undefined,
            undefined,
            undefined,
            { test: '1' },
            { test: '2' },
            { test: '3' },
          ],
        },
      });
    });

    it('should prepend touched fields', () => {
      const touchedFieldsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };
      const { result } = renderHook(() =>
        useFieldArray({
          control: {
            ...reconfigureControl(),
            touchedFieldsRef: touchedFieldsRef as any,
            readFormStateRef: {
              current: {
                touched: true,
              },
            } as any,
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.prepend({ test: 'test2' });
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [undefined, { test: '1' }, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.prepend([{ test: 'test1' }, { test: 'test3' }]);
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [
            undefined,
            undefined,
            undefined,
            { test: '1' },
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
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.prepend({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '0', test: 'test' }]);
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
                    value: { test: 'test' },
                    focus: mockFocus,
                  },
                },
                'test[1]': {
                  ref: {
                    name: 'test[1]',
                    value: { test: '1' },
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

      act(() => result.current.prepend({ test: 'test' }));

      expect(result.current.fields).toEqual([
        { id: '2', test: 'test' },
        { id: '0', test: '1' },
        { id: '1', test: '2' },
      ]);
      expect(mockFocus).toBeCalledTimes(1);
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
  });

  describe('remove', () => {
    it('should remove field according index', () => {
      const dirtyFieldsRef = {
        current: {
          test: [true, true],
        },
      };

      const touchedFieldsRef = {
        current: {
          test: [true, true],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: {
            ...reconfigureControl({
              defaultValuesRef: {
                current: { test: [{ test: '1' }, { test: '2' }] },
              },
              readFormStateRef: {
                current: {
                  touched: true,
                  dirtyFields: true,
                },
              } as any,
              fieldsRef: {
                current: {
                  'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                  'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
                },
              },
              getValues: () => ({ test: [] }),
            }),
            dirtyFieldsRef,
            touchedFieldsRef,
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove(0);
      });

      expect(dirtyFieldsRef.current).toEqual({
        test: [true],
      });

      expect(touchedFieldsRef.current).toEqual({
        test: [true],
      });
    });

    it('should remove field if isValid is true', () => {
      const mockControl = reconfigureControl({
        validFieldsRef: {
          current: new Set([
            'test[0].deep',
            'test[1].deep',
            'test[2].deep',
            'test[3].deep',
            'test[4].deep',
          ]),
        },
        fieldsWithValidationRef: {
          current: new Set([
            'test[0].deep',
            'test[1].deep',
            'test[2].deep',
            'test[3].deep',
            'test[4].deep',
          ]),
        },
      });
      const { result } = renderHook(() =>
        useFieldArray({
          control: {
            ...mockControl,
            readFormStateRef: {
              current: {
                ...mockControl.readFormStateRef.current,
                isValid: true,
              },
            },
            validateSchemaIsValid: undefined,
            defaultValuesRef: {
              current: {
                test: [
                  { deep: '1' },
                  { deep: '2' },
                  { deep: '3' },
                  { deep: '4' },
                  { deep: '5' },
                ],
              },
            },
            fieldsRef: {
              current: {
                'test[0].deep': {
                  ref: { name: 'test[0].deep', value: { deep: '1' } },
                },
                'test[1].deep': {
                  ref: { name: 'test[1].deep', value: { deep: '2' } },
                },
                'test[2].deep': {
                  ref: { name: 'test[2].deep', value: { deep: '3' } },
                },
                'test[3].deep': {
                  ref: { name: 'test[3].deep', value: { deep: '4' } },
                },
                'test[4].deep': {
                  ref: { name: 'test[4].deep', value: { deep: '5' } },
                },
              },
            },
            getValues: () => ({ test: [] }),
          },
          name: 'test',
        }),
      );

      act(() => result.current.remove(1));

      expect(mockControl.validFieldsRef.current).toEqual(
        new Set([
          'test[0].deep',
          'test[1].deep',
          'test[2].deep',
          'test[3].deep',
        ]),
      );
      expect(mockControl.fieldsWithValidationRef.current).toEqual(
        new Set([
          'test[0].deep',
          'test[1].deep',
          'test[2].deep',
          'test[3].deep',
        ]),
      );
    });

    it('should remove error', () => {
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
            getValues: () => ({ test: [] }),
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove(1);
      });

      expect(errorsRef).toEqual({
        current: {
          test: [{ test: '1' }, { test: '3' }],
        },
      });
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

    it('should remove test field in errorsRef if errorsRef.test.length is 0', () => {
      const errorsRef = {
        current: {
          test: [{ test: '1' }],
        },
      };
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            errorsRef: errorsRef as any,
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
              },
            },
            getValues: () => ({ test: [] }),
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove(0);
      });

      expect(errorsRef.current.test).toBeUndefined();
    });

    it('should remove touched fields', () => {
      const touchedFieldsRef = {
        current: {
          test: [{ test: '1' }, { test: '2' }, { test: '3' }],
        },
      };
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
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
            getValues: () => ({ test: [] }),
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove(1);
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [{ test: '1' }, { test: '3' }],
        },
      });
    });

    it('should remove all fields when index not supplied', () => {
      const dirtyFieldsRef = {
        current: {
          test: [true, true],
        },
      };

      const touchedFieldsRef = {
        current: {
          test: [true, true],
        },
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: {
            ...reconfigureControl(),
            readFormStateRef: {
              current: {
                touched: true,
                dirtyFields: true,
              },
            } as any,
            dirtyFieldsRef,
            touchedFieldsRef,
            getValues: () => ({ test: [] }),
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove();
      });

      expect(result.current.fields).toEqual([]);
      expect(dirtyFieldsRef.current).toEqual({});
      expect(touchedFieldsRef.current).toEqual({
        test: [],
      });
    });

    it('should remove specific fields when index is array', () => {
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

      const touchedFieldsRef = {
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
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
                'test[2]': { ref: { name: 'test[2]', value: { test: '3' } } },
              },
            },
            readFormStateRef: {
              current: {
                touched: true,
                dirtyFields: true,
              },
            } as any,
            dirtyFieldsRef,
            touchedFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove([0, 2]);
      });

      expect(result.current.fields).toEqual([{ test: '2', id: '1' }]);
      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test1: 1,
          },
        ],
      });
      expect(touchedFieldsRef.current).toEqual({
        test: [
          {
            test1: 1,
          },
        ],
      });
    });

    it('should set dirty to true when remove nested field', () => {
      const isDirtyRef = {
        current: false,
      };
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            isDirtyRef,
            defaultValuesRef: {
              current: {
                test: {
                  data: [{ name: 'Item 1' }],
                },
              },
            },
            fieldsRef: {
              current: {
                'test.data[0]': {
                  ref: { name: 'test.data[0]', value: { test: '1' } },
                },
              },
            },
            getValues: () => ({ test: { data: [] } }),
          }),
          name: 'test.data',
        }),
      );

      act(() => {
        result.current.remove(0);
      });

      expect(isDirtyRef.current).toBeTruthy();
    });

    it('should trigger reRender when user is watching the all field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            fieldsRef: {
              current: {
                'test[0]': {
                  ref: { name: 'test[0]', value: { test: '1' } },
                },
              },
            },
            getValues: () => ({ test: [] }),
            reRender,
            isWatchAllRef: {
              current: true,
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove(0);
      });

      expect(result.current.fields).toEqual([]);
      expect(reRender).toBeCalledTimes(2);
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
            {fields.map((_, i) => (
              <div key={i.toString()}>
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
});
