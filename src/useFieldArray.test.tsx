import * as React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { useFieldArray } from './useFieldArray';
import { reconfigureControl } from './__mocks__/reconfigureControl';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Control } from './types';
import { useForm } from './useForm';

jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.mock('./logic/generateId', () => ({
  default: () => '1',
}));

describe('useFieldArray', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('initialize', () => {
    it('should return default fields value', () => {
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl(),
          name: 'test',
        }),
      );

      expect(result.current.fields).toEqual([]);
    });

    it('should populate default values into fields', () => {
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }] },
            },
          }),
          name: 'test',
        }),
      );

      expect(result.current.fields).toEqual([
        { test: '1', id: '1' },
        { test: '2', id: '1' },
      ]);
    });
  });

  describe('append', () => {
    it('should append data into the fields', () => {
      const dirtyFieldsRef = {
        current: {
          test: [],
        },
      };

      const touchedFieldsRef = {
        current: {
          test: [],
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
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.append({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);

      act(() => {
        result.current.append({ test: 'test1' });
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: 'test' },
        { id: '1', test: 'test1' },
      ]);

      act(() => {
        result.current.append({});
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: 'test' },
        { id: '1', test: 'test1' },
        { id: '1' },
      ]);

      act(() => {
        result.current.append([{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: 'test' },
        { id: '1', test: 'test1' },
        { id: '1' },
        { id: '1', test: 'test2' },
        { id: '1', test: 'test3' },
      ]);

      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test: true,
          },
          {
            test: true,
          },
          {},
          {
            test: true,
          },
          {
            test: true,
          },
        ],
      });
    });

    it('should trigger reRender when user is watching the field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            watchFieldsRef: {
              current: new Set(['test']),
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.append({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);
      expect(reRender).toBeCalledTimes(3);
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
        result.current.append({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);
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
                    value: { test: '2' },
                    focus: mockFocus,
                  },
                },
                'test[2]': {
                  ref: {
                    name: 'test[2]',
                    value: { test: 'test' },
                    focus: mockFocus,
                  },
                },
              },
            },
          }),
          name: 'test',
        }),
      );

      act(() => result.current.append({ test: 'test' }));

      expect(result.current.fields).toEqual([
        { id: '1', test: '1' },
        { id: '1', test: '2' },
        { id: '1', test: 'test' },
      ]);
      expect(mockFocus).toBeCalledTimes(1);
    });
  });

  describe('prepend', () => {
    it('should pre-append data into the fields', () => {
      const dirtyFieldsRef = {
        current: {
          test: [],
        },
      };

      const touchedFieldsRef = {
        current: {
          test: [],
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
          },
          name: 'test',
        }),
      );

      act(() => {
        result.current.prepend({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);

      act(() => {
        result.current.prepend({ test: 'test1' });
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: 'test1' },
        { id: '1', test: 'test' },
      ]);

      act(() => {
        result.current.prepend({});
      });

      expect(result.current.fields).toEqual([
        { id: '1' },
        { id: '1', test: 'test1' },
        { id: '1', test: 'test' },
      ]);

      act(() => {
        result.current.prepend([{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: 'test2' },
        { id: '1', test: 'test3' },
        { id: '1' },
        { id: '1', test: 'test1' },
        { id: '1', test: 'test' },
      ]);

      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test: true,
          },
          {
            test: true,
          },
          {},
          {
            test: true,
          },
          {
            test: true,
          },
        ],
      });
    });

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
          test: [null, { test: '1' }, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.prepend([{ test: 'test1' }, { test: 'test3' }]);
      });

      expect(errorsRef).toEqual({
        current: {
          test: [null, null, null, { test: '1' }, { test: '2' }, { test: '3' }],
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
          test: [null, { test: '1' }, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.prepend([{ test: 'test1' }, { test: 'test3' }]);
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [null, null, null, { test: '1' }, { test: '2' }, { test: '3' }],
        },
      });
    });

    it('should trigger reRender when user is watching the field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            watchFieldsRef: {
              current: new Set(['test']),
            },
            getValues: () => ({ test: [] }),
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.prepend({ test: 'test' });
      });

      expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);
      expect(reRender).toBeCalledTimes(3);
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

      expect(result.current.fields).toEqual([{ id: '1', test: 'test' }]);
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
        { id: '1', test: 'test' },
        { id: '1', test: '1' },
        { id: '1', test: '2' },
      ]);
      expect(mockFocus).toBeCalledTimes(1);
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
            getValues: () => ({ test: [] }),
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

    it('should trigger reRender when user is watching the field array', () => {
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
            reRender,
            watchFieldsRef: {
              current: new Set(['test']),
            },
            getValues: () => ({ test: [] }),
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.remove(0);
      });

      expect(result.current.fields).toEqual([]);
      expect(reRender).toBeCalledTimes(3);
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
            { id: '1', value: '111' },
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
            getValues: () => ({ test: [] }),
            dirtyFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.insert(1, { test: '3' });
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '1' },
        { id: '1', test: '3' },
        { id: '1', test: '2' },
      ]);

      act(() => {
        result.current.insert(1, [{ test: '4' }, { test: '5' }]);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '1' },
        { id: '1', test: '4' },
        { id: '1', test: '5' },
        { id: '1', test: '3' },
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
            getValues: () => ({ test: [] }),
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
          test: [{ test: '1' }, null, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.insert(1, [{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(touchedFieldsRef).toEqual({
        current: {
          test: [{ test: '1' }, null, null, null, { test: '2' }, { test: '3' }],
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
            getValues: () => ({ test: [] }),
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
          test: [{ test: '1' }, null, { test: '2' }, { test: '3' }],
        },
      });

      act(() => {
        result.current.insert(1, [{ test: 'test2' }, { test: 'test3' }]);
      });

      expect(errorsRef).toEqual({
        current: {
          test: [{ test: '1' }, null, null, null, { test: '2' }, { test: '3' }],
        },
      });
    });

    it('should trigger reRender when user is watching the field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            watchFieldsRef: {
              current: new Set(['test']),
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
        result.current.insert(1, { test: 'test' });
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '1' },
        { id: '1', test: 'test' },
        { id: '1', test: '2' },
      ]);
      expect(reRender).toBeCalledTimes(3);
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
            getValues: () => ({ test: [] }),
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
        { id: '1', test: '1' },
        { id: '1', test: 'test' },
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
            getValues: () => ({ test: [] }),
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
        { id: '1', test: '1' },
        { id: '1', test: 'test' },
        { id: '1', test: '2' },
      ]);
      expect(mockFocus).toBeCalledTimes(1);
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
            getValues: () => ({ test: [] }),
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
        { id: '1', test: '1' },
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

    it('should trigger reRender when user is watching the field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            watchFieldsRef: {
              current: new Set(['test']),
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
        { id: '1', test: '1' },
      ]);
      expect(reRender).toBeCalledTimes(3);
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
        { id: '1', test: '1' },
      ]);
      expect(reRender).toBeCalledTimes(1);
    });
  });

  describe('move', () => {
    it('should move into pointed position', () => {
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
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
            readFormStateRef: {
              current: {
                dirtyFields: true,
              },
            } as any,
            fieldsRef: {
              current: {
                'test[0]': { ref: { name: 'test[0]', value: { test: '1' } } },
                'test[1]': { ref: { name: 'test[1]', value: { test: '2' } } },
                'test[2]': { ref: { name: 'test[2]', value: { test: '3' } } },
              },
            },
            dirtyFieldsRef,
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.move(2, 0);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '3' },
        { id: '1', test: '1' },
        { id: '1', test: '2' },
      ]);

      expect(dirtyFieldsRef.current).toEqual({
        test: [
          {
            test2: 1,
          },
          {
            test: 1,
          },
          {
            test1: 1,
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

    it('should move touched fields', () => {
      const touchedFieldsRef = {
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
        test: [{ test: '3' }, { test: '1' }, { test: '2' }],
      });
    });

    it('should call be able to reset the Field Array', () => {
      const resetFieldArrayFunctionRef = {
        current: {},
      };

      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            resetFieldArrayFunctionRef,
            defaultValuesRef: {
              current: { test: [{ test: '1' }, { test: '2' }, { test: '3' }] },
            },
          }),
          name: 'test',
        }),
      );

      act(() => {
        result.current.append({ test: 'test' });
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '1' },
        { id: '1', test: '2' },
        { id: '1', test: '3' },
        { id: '1', test: 'test' },
      ]);

      act(() => {
        // @ts-ignore
        resetFieldArrayFunctionRef.current['test']();
      });

      expect(result.current.fields).toEqual([
        { test: '1', id: '1' },
        { test: '2', id: '1' },
        { test: '3', id: '1' },
      ]);
    });

    it('should trigger reRender when user is watching the field array', () => {
      const reRender = jest.fn();
      const { result } = renderHook(() =>
        useFieldArray({
          control: reconfigureControl({
            reRender,
            watchFieldsRef: {
              current: new Set(['test']),
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
        result.current.move(0, 1);
      });

      expect(result.current.fields).toEqual([
        { id: '1', test: '2' },
        { id: '1', test: '1' },
      ]);
      expect(reRender).toBeCalledTimes(3);
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
        { id: '1', test: '1' },
      ]);
      expect(reRender).toBeCalledTimes(1);
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
        test: [{ id: '1', test: 'value' }],
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
