import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useForm } from './';
import attachEventListeners from './logic/attachEventListeners';
import getFieldsValues from './logic/getFieldsValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import validateWithSchema from './logic/validateWithSchema';
import validateField from './logic/validateField';
import onDomRemove from './utils/onDomRemove';
import { VALIDATION_MODE } from './constants';
import { Control } from './types';

export const reconfigureControl = (
  controlOverrides: Partial<Control> = {},
): Control => ({
  defaultValuesRef: {
    current: {},
  },
  getValues: jest.fn(),
  setValue: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  triggerValidation: jest.fn(),
  removeEventListener: jest.fn(),
  errorsRef: { current: {} },
  touchedFieldsRef: { current: {} },
  mode: { isOnSubmit: false, isOnBlur: false },
  reValidateMode: {
    isReValidateOnBlur: false,
    isReValidateOnSubmit: false,
  },
  formState: {
    dirty: false,
    isSubmitted: false,
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
    },
  },
  ...controlOverrides,
});

jest.mock('./utils/onDomRemove');
jest.mock('./logic/findRemovedFieldAndRemoveListener');
jest.mock('./logic/validateField');
jest.mock('./logic/attachEventListeners');
jest.mock('./logic/getFieldsValues');
jest.mock('./logic/validateWithSchema');
jest.mock('./logic/transformToNestObject', () => ({
  default: (data: any) => data,
  esmodule: true,
}));

describe('useForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('should return undefined when ref is undefined', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        expect(result.current.register(undefined as any)).toBeUndefined();
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
        await result.current.handleSubmit(data => {
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
        await result.current.handleSubmit(data => {
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

      act(() => {
        const { register } = result.current;
        register({ type: 'checkbox', name: 'test', attributes: {} });
        register({ type: 'checkbox', name: 'test', attributes: {} });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit(data => {
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
        await result.current.handleSubmit(data => {
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
      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });
      const { result } = renderHook(() => useForm<{ test: string }>());

      expect(result.current.watch('test')).toBeUndefined();

      act(() => {
        result.current.register({ type: 'radio', name: 'test', value: '' });
      });

      (getFieldsValues as any).mockImplementation(() => {
        return { test: 'data' };
      });

      expect(result.current.watch('test')).toBe('data');
    });

    it('should watch array of inputs', () => {
      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>(),
      );

      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: undefined,
        test1: undefined,
      });

      act(() => {
        result.current.register({ type: 'radio', name: 'test', value: '' });
        result.current.register({ type: 'radio', name: 'test1', value: '' });
      });

      (getFieldsValues as any).mockImplementation(() => {
        return {
          test: 'data1',
          test1: 'data2',
        };
      });

      expect(result.current.watch(['test', 'test1'])).toEqual({
        test: 'data1',
        test1: 'data2',
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

      (getFieldsValues as any).mockImplementation(() => {
        return {
          test: 'data1',
          test1: 'data2',
        };
      });

      expect(result.current.watch()).toEqual({
        test: 'data1',
        test1: 'data2',
      });
    });
  });

  describe('reset', () => {
    it('should reset the form and re-render the form', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ name: 'test' });
        result.current.setValue('test', 'data');
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
      });

      await act(async () => {
        await result.current.handleSubmit(data => {
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
        result.current.setValue('test', '1');
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
      });

      await act(async () => {
        await result.current.handleSubmit(data => {
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
        result.current.setValue('test', '1');
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
      });

      await act(async () => {
        await result.current.handleSubmit(data => {
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
        result.current.setValue('test', '1');
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
      });

      await act(async () => {
        await result.current.handleSubmit(data => {
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
        await result.current.handleSubmit(data => {
          expect(data).toEqual({
            test: ['1'],
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });

    it('should return undefined when filed not found', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        expect(result.current.setValue('test', '1')).toBeUndefined();
      });
    });
  });

  describe('triggerValidation', () => {
    it('should return false when field is not found', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      await act(async () => {
        expect(await result.current.triggerValidation('test')).toBeFalsy();
      });
    });

    it('should return true when field is found and validation pass', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ type: 'input', name: 'test' });
      });

      (validateField as any).mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        expect(await result.current.triggerValidation('test')).toBeTruthy();
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
        expect(await result.current.triggerValidation('test')).toBeTruthy();
      });
    });

    it('should trigger multiple fields validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
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
        await result.current.triggerValidation(['test', 'test1'] as any);
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

  describe('triggerValidation with schema', () => {
    it('should return the error with single field validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async (payload: any) => {
        return {
          errors: payload,
          values: {},
        };
      });

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.triggerValidation('test');
      });
      expect(result.current.errors).toEqual({ test: 'test' });
    });

    it('should return the status of the requested field with single field validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test2: 'test2' },
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async (payload: any) => {
        return {
          errors: payload,
          values: {},
        };
      });

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
        const resultFalse = await result.current.triggerValidation('test2');
        expect(resultFalse).toEqual(false);
      });

      expect(result.current.errors).toEqual({
        test2: 'test2',
      });
    });

    it('should not trigger any error when schema validation result not found', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async () => {
        return {
          errors: {
            values: 'test',
          },
          result: {},
        };
      });

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.triggerValidation('test');
      });

      expect(result.current.errors).toEqual({});
    });

    it('should support array of fields for schema validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string; test1: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: {},
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async () => {
        return {
          errors: {
            test1: 'test1',
            test: 'test',
          },
          result: {},
        };
      });

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      await act(async () => {
        await result.current.triggerValidation(['test', 'test1']);
      });

      expect(result.current.errors).toEqual({
        test: 'test',
        test1: 'test1',
      });
    });

    it('should return the status of the requested fields with array of fields for validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test1: string; test2: string; test3: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test3: 'test3' },
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async (payload: any) => {
        return {
          errors: payload,
          values: {},
        };
      });

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
        const resultTrue = await result.current.triggerValidation([
          'test1',
          'test2',
        ]);
        expect(resultTrue).toEqual(true);

        const resultFalse = await result.current.triggerValidation([
          'test2',
          'test3',
        ]);
        expect(resultFalse).toEqual(false);
      });

      expect(result.current.errors).toEqual({
        test3: 'test3',
      });
    });

    it('should validate all fields when pass with undefined', async () => {
      const { result } = renderHook(() =>
        useForm<{ test1: string; test: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async () => {
        return {
          errors: {
            test1: 'test1',
            test: 'test',
          },
          result: {},
        };
      });

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
        await result.current.triggerValidation();
      });

      expect(result.current.errors).toEqual({
        test: 'test',
        test1: 'test1',
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
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          validationSchema: {},
        }),
      );

      (getFieldsValues as any).mockImplementation(() => {
        return {};
      });

      (validateWithSchema as any).mockImplementation(async () => {
        return {
          errors: {},
          values: {},
        };
      });

      act(() => {
        result.current.register(
          { value: '', type: 'input', name: 'test' },
          { required: true },
        );
      });

      const callback = jest.fn();
      (getFieldsValues as any).mockImplementation(async () => {
        return { test: 'test' };
      });

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(callback).toBeCalled();
    });
  });

  describe('getValues', () => {
    it('should call getFieldsValues and return all values', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      act(() => {
        result.current.register({ value: 'test', type: 'input', name: 'test' });
      });
      (getFieldsValues as any).mockImplementation(async () => {
        return {};
      });
      act(() => {
        result.current.getValues();
      });
      expect(getFieldsValues).toBeCalled();
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
        useForm<{ input: string; input1: string }>(),
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
          validationSchema: {},
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
        useForm<{ input: string }>({
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
        useForm<{ input: string }>({
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
        useForm<{ input: string }>({
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
  });
});
