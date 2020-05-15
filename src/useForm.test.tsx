import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { render, fireEvent } from '@testing-library/react';
import { useForm } from './';
import attachEventListeners from './logic/attachEventListeners';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import validateField from './logic/validateField';
import onDomRemove from './utils/onDomRemove';
import { VALIDATION_MODE } from './constants';
import { Control, NestedValue } from './types';

export const reconfigureControl = (
  controlOverrides: Partial<Control> = {},
): Control => ({
  defaultValuesRef: {
    current: {},
  },
  isWatchAllRef: {
    current: false,
  },
  validFieldsRef: {
    current: new Set(),
  },
  fieldsWithValidationRef: {
    current: new Set(),
  },
  fieldArrayDefaultValues: {
    current: {},
  },
  watchFieldsRef: {
    current: new Set(),
  },
  dirtyFieldsRef: {
    current: {},
  },
  watchFieldsHookRef: {
    current: {},
  },
  watchFieldsHookRenderRef: {
    current: {},
  },
  watchInternal: jest.fn(),
  validateSchemaIsValid: jest.fn(),
  getValues: jest.fn(),
  reRender: jest.fn(),
  setValue: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  trigger: jest.fn(),
  removeFieldEventListener: jest.fn(),
  errorsRef: { current: {} },
  touchedFieldsRef: { current: {} },
  mode: { isOnSubmit: false, isOnBlur: false, isOnChange: false },
  reValidateMode: {
    isReValidateOnBlur: false,
    isReValidateOnSubmit: false,
  },
  formState: {
    dirty: false,
    isSubmitted: false,
    dirtyFields: {},
    submitCount: 0,
    touched: {},
    isSubmitting: false,
    isValid: false,
  },
  fieldsRef: {
    current: {},
  },
  resetFieldArrayFunctionRef: {
    current: {},
  },
  fieldArrayNamesRef: {
    current: new Set<string>(),
  },
  isDirtyRef: {
    current: false,
  },
  readFormStateRef: {
    current: {
      dirty: true,
      isSubmitted: false,
      submitCount: false,
      touched: false,
      isSubmitting: false,
      isValid: false,
      dirtyFields: false,
    },
  },
  renderWatchedInputs: () => {},
  ...controlOverrides,
});

jest.mock('./utils/onDomRemove');
jest.mock('./logic/findRemovedFieldAndRemoveListener');
jest.mock('./logic/validateField');
jest.mock('./logic/attachEventListeners');
jest.mock('./logic/transformToNestObject', () => ({
  default: (data: any) => data,
  esmodule: true,
}));

let nodeEnv: any;

describe('useForm', () => {
  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.resetAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv;
  });

  describe('register', () => {
    it('should return undefined when ref is defined', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        expect(result.current.register(undefined as any)).toBeDefined();
      });
    });

    it('should return undefined when ref name is missing', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        expect(
          result.current.register({ name: 'test', type: 'input' }, {}),
        ).toBeUndefined();
      });
    });

    it('should register field and call attachEventListeners method', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register({ type: 'input', name: 'test' });
      });

      expect(attachEventListeners).toHaveBeenCalledWith({
        field: {
          mutationWatcher: undefined,
          ref: {
            name: 'test',
            type: 'input',
          },
        },
        isRadioOrCheckbox: false,
        handleChange: expect.any(Function),
      });
      expect(onDomRemove).toHaveBeenCalled();
    });

    it('should register field for radio type and call attachEventListeners method', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register({ type: 'radio', name: 'test' });
      });

      expect(attachEventListeners).toBeCalledWith({
        field: {
          mutationWatcher: undefined,
          ref: {
            name: 'test',
            type: 'radio',
          },
        },
        isRadioOrCheckbox: true,
        handleChange: expect.any(Function),
      });
      expect(onDomRemove).toBeCalled();
    });

    it('should register field for checkbox type and call attachEventListeners method', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register({
          type: 'checkbox',
          name: 'test',
          attributes: {},
        });
      });

      expect(attachEventListeners).toBeCalledWith({
        field: {
          mutationWatcher: undefined,
          ref: {
            name: 'test',
            type: 'checkbox',
            attributes: {},
          },
        },
        isRadioOrCheckbox: true,
        handleChange: expect.any(Function),
      });
      expect(onDomRemove).toBeCalled();
    });

    it('should support register passed to ref', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ required: true })!({
          type: 'text',
          name: 'test',
          value: 'testData',
        });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: 'testData',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should not register the same radio input', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        const { register } = result.current;
        register({ type: 'radio', name: 'test', value: '' });
        register({ type: 'radio', name: 'test', value: '' });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should not register the same checkbox input', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      const ref = document.createElement('INPUT');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'checkbox');

      act(() => {
        const { register } = result.current;
        register(ref as any);
        register(ref as any);
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: false,
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('react native - allow registration as part of the register call', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ name: 'test' });
        result.current.setValue('test', '1');
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '1',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });
  });

  describe('unregister', () => {
    it('should unregister an registered item', async () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register({ name: 'input' });
        result.current.unregister('input');
      });

      const callback = jest.fn();

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });

      expect(findRemovedFieldAndRemoveListener).toBeCalled();
    });
  });

  describe('watch', () => {
    it('should watch individual input', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      expect(result.current.watch('test')).toBeUndefined();

      act(() => {
        result.current.register({ type: 'radio', name: 'test', value: 'data' });
      });

      expect(result.current.control.watchFieldsRef).toEqual({
        current: new Set(['test']),
      });
    });

    it('should watch array of inputs', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: undefined,
        test1: undefined,
      });

      act(() => {
        result.current.register({
          type: 'radio',
          name: 'test',
          value: 'data1',
        });
        result.current.register({
          type: 'radio',
          name: 'test1',
          value: 'data2',
        });
      });

      expect(result.current.control.watchFieldsRef).toEqual({
        current: new Set(['test', 'test1']),
      });
    });

    it('should watch every fields', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      expect(result.current.watch()).toEqual({});

      act(() => {
        result.current.register({ type: 'radio', name: 'test', value: '' });
        result.current.register({ type: 'radio', name: 'test1', value: '' });
      });

      expect(result.current.control.isWatchAllRef).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('should reset the form and re-render the form', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ name: 'test' });
        result.current.setValue('test', 'data');
      });

      (validateField as any).mockImplementation(async () => ({}));

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
      act(() => {
        result.current.reset();
      });
      expect(result.current.formState.isSubmitted).toBeFalsy();
    });
  });

  describe('setValue', () => {
    it('should set value of radio input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ name: 'test', type: 'radio', value: '1' });
        result.current.register({ name: 'test', type: 'radio', value: '2' });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.setValue('test', '1');
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '1',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set value of multiple checkbox input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({
          name: 'test',
          type: 'checkbox',
          value: '1',
          attributes: { value: '1' },
        });
        result.current.register({
          name: 'test',
          type: 'checkbox',
          value: '2',
          attributes: { value: '2' },
        });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.setValue('test', '1');
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: ['1'],
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set value of single checkbox input correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({
          name: 'test',
          type: 'checkbox',
          value: '1',
          attributes: { value: '1' },
        });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.setValue('test', '1');
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: '1',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set value of multiple select correctly', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({
          name: 'test',
          type: 'select-multiple',
          value: '1',
          options: [{ value: '1', selected: true }] as any,
        });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.setValue('test', '1');
      });

      await act(async () => {
        await result.current.handleSubmit((data) => {
          expect(data).toEqual({
            test: ['1'],
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should set nested value correctly ', () => {
      const { result } = renderHook(() =>
        useForm<{
          test1: NestedValue<string[]>;
          test2: NestedValue<{
            key1: string;
            key2: number;
          }>;
          test3: NestedValue<
            {
              key1: string;
              key2: number;
            }[]
          >;
        }>(),
      );

      act(() => {
        result.current.register('test1');
        result.current.register('test2');
        result.current.register('test3');
      });

      act(() => {
        result.current.setValue('test1', ['1', '2', '3']);
        result.current.setValue('test2', { key1: '1', key2: 2 });
        result.current.setValue('test3', [
          { key1: '1', key2: 2 },
          { key1: '3', key2: 4 },
        ]);

        expect(result.current.control.fieldsRef.current['test1']).toEqual({
          ref: { name: 'test1', value: ['1', '2', '3'] },
        });
        expect(result.current.control.fieldsRef.current['test2']).toEqual({
          ref: { name: 'test2', value: { key1: '1', key2: 2 } },
        });
        expect(result.current.control.fieldsRef.current['test3']).toEqual({
          ref: {
            name: 'test3',
            value: [
              { key1: '1', key2: 2 },
              { key1: '3', key2: 4 },
            ],
          },
        });
      });
    });

    it('should return undefined when filed not found', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        expect(result.current.setValue('test', '1')).toBeUndefined();
      });
    });

    it('should work with array fields', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register('test1[0].test');
        result.current.register('test[0]');
        result.current.register('test[1]');
        result.current.register('test[2]');
      });

      act(() => {
        result.current.setValue('test', ['1', '2', '3']);

        expect(result.current.control.fieldsRef.current['test[0]']).toEqual({
          ref: { name: 'test[0]', value: '1' },
        });
        expect(result.current.control.fieldsRef.current['test[1]']).toEqual({
          ref: { name: 'test[1]', value: '2' },
        });
        expect(result.current.control.fieldsRef.current['test[2]']).toEqual({
          ref: { name: 'test[2]', value: '3' },
        });
      });
    });

    it('should worked with nested array fields with object', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register('test[0].test');
        result.current.register('test[1].test');
        result.current.register('test[2].test');
      });

      act(() => {
        result.current.setValue('test', [
          { test: '1' },
          { test: '2' },
          { test: '3' },
        ]);

        expect(
          result.current.control.fieldsRef.current['test[0].test'],
        ).toEqual({
          ref: { name: 'test[0].test', value: '1' },
        });
        expect(
          result.current.control.fieldsRef.current['test[1].test'],
        ).toEqual({
          ref: { name: 'test[1].test', value: '2' },
        });
        expect(
          result.current.control.fieldsRef.current['test[2].test'],
        ).toEqual({
          ref: { name: 'test[2].test', value: '3' },
        });
      });
    });

    it('should work with object fields', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register('test1[0].test');
        result.current.register('test.bill');
        result.current.register('test.luo');
        result.current.register('test.test');
      });

      act(() => {
        result.current.setValue('test', { bill: '1', luo: '2', test: '3' });

        expect(result.current.control.fieldsRef.current['test.bill']).toEqual({
          ref: { name: 'test.bill', value: '1' },
        });
        expect(result.current.control.fieldsRef.current['test.luo']).toEqual({
          ref: { name: 'test.luo', value: '2' },
        });
        expect(result.current.control.fieldsRef.current['test.test']).toEqual({
          ref: { name: 'test.test', value: '3' },
        });
      });
    });

    it('should work array of fields', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        result.current.register('test.bill');
        result.current.register('test.luo');
        result.current.register('test.test');
        result.current.register('array[0]');
        result.current.register('array[1]');
        result.current.register('array[2]');
        result.current.register('object.bill');
        result.current.register('object.luo');
        result.current.register('object.test');
      });

      act(() => {
        result.current.setValue([
          { 'test.bill': '1' },
          { array: ['1', '2', '3'] },
          { object: { bill: '1', luo: '2', test: '3' } },
        ]);

        expect(result.current.control.fieldsRef.current['test.bill']).toEqual({
          ref: { name: 'test.bill', value: '1' },
        });

        expect(result.current.control.fieldsRef.current['array[0]']).toEqual({
          ref: { name: 'array[0]', value: '1' },
        });
        expect(result.current.control.fieldsRef.current['array[1]']).toEqual({
          ref: { name: 'array[1]', value: '2' },
        });
        expect(result.current.control.fieldsRef.current['array[2]']).toEqual({
          ref: { name: 'array[2]', value: '3' },
        });

        expect(result.current.control.fieldsRef.current['object.bill']).toEqual(
          {
            ref: { name: 'object.bill', value: '1' },
          },
        );
        expect(result.current.control.fieldsRef.current['object.luo']).toEqual({
          ref: { name: 'object.luo', value: '2' },
        });
        expect(result.current.control.fieldsRef.current['object.test']).toEqual(
          {
            ref: { name: 'object.test', value: '3' },
          },
        );
      });
    });
  });

  describe('trigger', () => {
    it('should return false when field is not found', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      await act(async () => {
        expect(await result.current.trigger('test')).toBeFalsy();
      });
    });

    it('should return true when field is found and validation pass', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ type: 'input', name: 'test' });
      });

      (validateField as any).mockImplementation(async () => ({}));

      await act(async () => {
        expect(await result.current.trigger('test')).toBeTruthy();
      });
    });

    it('should update value when value is supplied', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        expect(await result.current.trigger('test')).toBeTruthy();
      });
    });

    it('should trigger multiple fields validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => ({}));

      act(() => {
        result.current.register({
          name: 'test',
        });
        result.current.register({
          name: 'test1',
        });
      });

      await act(async () => {
        await result.current.trigger(['test', 'test1'] as any);
      });

      expect(validateField).toBeCalledWith(
        {
          current: {
            test: { ref: { name: 'test' } },
            test1: { ref: { name: 'test1' } },
          },
        },
        false,
        { ref: { name: 'test' } },
      );
      expect(validateField).toBeCalledWith(
        {
          current: {
            test: { ref: { name: 'test' } },
            test1: { ref: { name: 'test1' } },
          },
        },
        false,
        { ref: { name: 'test1' } },
      );
    });
  });

  describe('trigger with schema', () => {
    it('should return the error with single field validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.trigger('test');
        expect(result.current.errors).toEqual({ test: { type: 'test' } });
      });
    });

    it('should return the status of the requested field with single field validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test2: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test1' },
          { required: false },
        );
        result.current.register(
          { type: 'input', name: 'test2' },
          { required: true },
        );
      });

      await act(async () => {
        const resultFalse = await result.current.trigger('test2');
        expect(resultFalse).toEqual(false);

        expect(result.current.errors).toEqual({
          test2: {
            type: 'test',
          },
        });
      });
    });

    it('should not trigger any error when schema validation result not found', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            value: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          // @ts-ignore
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.trigger('test');
      });

      expect(result.current.errors).toEqual({});
    });

    it('should support array of fields for schema validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test1: {
              type: 'test1',
            },
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.trigger(['test', 'test1']);

        expect(result.current.errors).toEqual({
          test1: {
            type: 'test1',
          },
          test: {
            type: 'test',
          },
        });
      });
    });

    it('should return the status of the requested fields with array of fields for validation', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: { test3: 'test3' },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string; test3: string }>({
          mode: VALIDATION_MODE.onChange,
          // @ts-ignore
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test1' },
          { required: false },
        );
        result.current.register(
          { type: 'input', name: 'test2' },
          { required: false },
        );
        result.current.register(
          { type: 'input', name: 'test3' },
          { required: true },
        );
      });

      await act(async () => {
        const resultTrue = await result.current.trigger(['test1', 'test2']);
        expect(resultTrue).toEqual(true);
      });
    });

    it('should validate all fields when pass with undefined', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {
            test1: {
              type: 'test1',
            },
            test: {
              type: 'test',
            },
          },
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test1: string; test: string }>({
          mode: VALIDATION_MODE.onChange,
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
        result.current.register(
          { type: 'input', name: 'test1' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.trigger();

        expect(result.current.errors).toEqual({
          test1: {
            type: 'test1',
          },
          test: {
            type: 'test',
          },
        });
      });
    });
  });

  describe('handleSubmit', () => {
    it('should invoke the callback when validation pass', async () => {
      const { result } = renderHook(() => useForm());
      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should not invoke callback when there are errors', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register(
          { value: '', type: 'input', name: 'test' },
          { required: true },
        );
      });

      const callback = jest.fn();
      (validateField as any).mockImplementation(async () => {
        return { test: { type: 'test' } };
      });

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).not.toBeCalled();
    });
  });

  describe('handleSubmit with validationSchema', () => {
    it('should invoke callback when error not found', async () => {
      const resolver = async (data: any) => {
        return {
          values: data,
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { value: '', type: 'input', name: 'test' },
          { required: true },
        );
      });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });

    it('should invoke callback with transformed values', async () => {
      const resolver = async () => {
        return {
          values: { test: 'test' },
          errors: {},
        };
      };

      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          resolver,
        }),
      );

      act(() => {
        result.current.register(
          { value: '', type: 'input', name: 'test' },
          { required: true },
        );
      });

      const callback = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback.mock.calls[0][0]).toEqual({ test: 'test' });
    });
  });

  describe('getValues', () => {
    it('should call getFieldsValues and return all values', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      act(() => {
        result.current.register({ value: 'test', type: 'input', name: 'test' });
      });
      expect(result.current.getValues()).toEqual({ test: 'test' });
    });

    it('should get individual field value', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          defaultValues: {
            test: '123',
          },
        }),
      );
      act(() => {
        result.current.register({ type: 'input', name: 'test' });
      });
      expect(result.current.getValues('test')).toEqual('123');
    });
  });

  describe('setError', () => {
    it('should only set an error when it is not existed', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      act(() => {
        result.current.setError('input', 'test');
      });
      expect(result.current.errors).toEqual({
        input: {
          type: 'test',
          isManual: true,
          message: undefined,
          ref: {},
        },
      });

      act(() => {
        result.current.setError('input', 'test', 'test');
      });
      expect(result.current.errors).toEqual({
        input: {
          type: 'test',
          isManual: true,
          message: 'test',
          ref: {},
        },
      });

      act(() => {
        result.current.setError('input', 'test', <p>test</p>);
      });
      expect(result.current.errors).toEqual({
        input: {
          type: 'test',
          isManual: true,
          message: <p>test</p>,
          ref: {},
        },
      });

      act(() => {
        result.current.setError('input', { test1: 'test1', test2: 'test2' });
      });
      expect(result.current.errors).toEqual({
        input: {
          type: '',
          isManual: true,
          message: undefined,
          types: {
            test1: 'test1',
            test2: 'test2',
          },
          ref: {},
        },
      });

      act(() => {
        result.current.setError('input', {
          test1: 'test1',
          test2: <p>test2</p>,
        });
      });
      expect(result.current.errors).toEqual({
        input: {
          type: '',
          isManual: true,
          message: undefined,
          types: {
            test1: 'test1',
            test2: <p>test2</p>,
          },
          ref: {},
        },
      });
    });

    it('should remove error', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      act(() => {
        result.current.setError('input', 'test', 'message');
        result.current.clearError('input');
      });
      expect(result.current.errors).toEqual({});
    });

    it('should remove nested error', () => {
      const { result } = renderHook(() =>
        useForm<{ input: { nested: string } }>(),
      );
      act(() => {
        result.current.setError('input.nested', 'test');
      });
      expect(result.current.errors.input?.nested).toBeDefined();
      act(() => {
        result.current.clearError('input.nested');
      });
      expect(result.current.errors.input?.nested).not.toBeDefined();
    });
  });

  describe('setErrors', () => {
    it('should set multiple errors for the form', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; input1: string; input2: string }>(),
      );
      act(() => {
        result.current.setError([
          {
            type: 'test',
            name: 'input',
            message: 'wow',
          },
          {
            type: 'test1',
            name: 'input1',
            message: 'wow1',
          },
          {
            type: 'test2',
            name: 'input2',
            message: <p>wow2</p>,
          },
        ]);
      });

      expect(result.current.errors).toEqual({
        input: {
          type: 'test',
          isManual: true,
          message: 'wow',
          ref: {},
        },
        input1: {
          type: 'test1',
          isManual: true,
          message: 'wow1',
          ref: {},
        },
        input2: {
          type: 'test2',
          isManual: true,
          message: <p>wow2</p>,
          ref: {},
        },
      });
    });
  });

  describe('formState', () => {
    it('should disable isValid for submit mode', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      expect(result.current.formState.isValid).toBeFalsy();
    });

    it('should return true for onBlur mode by default', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onBlur,
        }),
      );

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return true for onBlur when validation schema by default', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onBlur,
          // validationSchema: {},
        }),
      );

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return true for onChange mode by default', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return true when no validation is registered', () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onBlur,
        }),
      );

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
      });

      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return false when default value is not valid value', async () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; issue: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return { issue: 'issue' };
      });

      await act(async () => {
        result.current.formState.isValid;
      });

      await act(async () => {
        result.current.register(
          { name: 'issue', value: 'test' },
          { required: true },
        );
        result.current.register({ name: 'input' });
      });

      expect(result.current.formState.isValid).toBeFalsy();
    });

    it('should return true when default value meet the validation criteria', async () => {
      const { result } = renderHook(() =>
        useForm<{ input: string; issue: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        result.current.formState.isValid;
      });

      await act(async () => {
        result.current.register(
          { name: 'issue', value: 'test' },
          { required: true },
        );
        result.current.register({ name: 'input' }, { required: true });

        expect(result.current.formState.isValid).toBeTruthy();
      });
    });

    it('should be a proxy object that returns undefined for unknown properties', () => {
      const { result } = renderHook(() => useForm());

      // @ts-ignore
      expect(result.current.formState.nonExistentProperty).toBe(undefined);
    });

    it('should be a proxy object that properly implements the has trap', () => {
      const { result } = renderHook(() => useForm());

      // @ts-ignore
      expect('nonExistentProperty' in result.current.formState).toBe(false);
    });

    it('should be a proxy object that hasOwnProperty works on', () => {
      const { result } = renderHook(() => useForm());

      // @ts-ignore
      expect(
        result.current.formState.hasOwnProperty('nonExistentProperty'),
      ).toBe(false);
    });
  });

  describe('when component unMount', () => {
    it('should call unSubscribe', () => {
      const { result, unmount } = renderHook(() => useForm<{ test: string }>());

      result.current.register({ type: 'text', name: 'test' });
      unmount();
      expect(findRemovedFieldAndRemoveListener).toBeCalled();
    });
  });

  describe('when defaultValues is supplied', () => {
    it('should populate the input with them', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; deep: { nested: string; values: string } }>({
          mode: VALIDATION_MODE.onSubmit,
          defaultValues: {
            test: 'data',
            deep: {
              values: '5',
            },
          },
        }),
      );

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
        result.current.register({ type: 'text', name: 'deep.nested' });
        result.current.register({ type: 'text', name: 'deep.values' });
      });

      await act(async () => {
        await result.current.handleSubmit((data: any) => {
          expect(data).toEqual({
            test: 'data',
            'deep.nested': undefined,
            'deep.values': '5',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should infer from defaultValues without a type parameter', () => {
      const { result } = renderHook(() =>
        useForm({
          mode: VALIDATION_MODE.onSubmit,
          defaultValues: {
            test: 'data',
            deep: {
              values: '5',
            },
          },
        }),
      );

      act(() => {
        const test: string = result.current.getValues().test;
        expect(test).toEqual('data');
        const deep: { values: string } = result.current.getValues().deep;
        expect(deep).toEqual({ values: '5' });
      });
    });
  });

  describe('when errors changes', () => {
    it('should display the latest error message', () => {
      const Form = () => {
        const { register, setError, errors } = useForm();

        React.useEffect(() => {
          setError('test', 'data', 'data');
        });

        return (
          <div>
            <input
              ref={register({
                maxLength: {
                  message: 'max',
                  value: 3,
                },
              })}
              placeholder="test"
              name="test"
            />
            <p>{errors.test && errors.test.message}</p>
          </div>
        );
      };

      const { getByPlaceholderText, getByText } = render(<Form />);

      getByText('data');

      const textInput = getByPlaceholderText('test');
      fireEvent.input(textInput, {
        target: {
          value: 'test',
        },
      });

      expect(getByText('data')).toBeTruthy();
    });
  });
});
