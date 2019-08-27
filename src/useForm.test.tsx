import * as React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import useForm from './';
import attachEventListeners from './logic/attachEventListeners';
import getFieldsValues from './logic/getFieldValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import validateWithSchema from './logic/validateWithSchema';
import validateField from './logic/validateField';
import onDomRemove from './utils/onDomRemove';
import { VALIDATION_MODE } from './constants';

jest.mock('./utils/onDomRemove');
jest.mock('./logic/findRemovedFieldAndRemoveListener');
jest.mock('./logic/validateField');
jest.mock('./logic/attachEventListeners');
jest.mock('./logic/getFieldValues');
jest.mock('./logic/validateWithSchema');
jest.mock('./logic/combineFieldValues', () => ({
  // @ts-ignore
  default: data => data,
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
        // @ts-ignore
        expect(result.current.register(undefined)).toBeUndefined();
      });
    });

    it('should return undefined when ref name is missing', () => {
      const { result } = renderHook(() => useForm());

      act(() => {
        // @ts-ignore
        expect(result.current.register({ type: 'input' }, {})).toBeUndefined();
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
        isRadio: false,
        validateAndStateUpdate: expect.any(Function),
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
        isRadio: true,
        validateAndStateUpdate: expect.any(Function),
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

      // @ts-ignore
      validateField.mockImplementation(async () => {
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

      // @ts-ignore
      validateField.mockImplementation(async () => {
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
  });

  describe('watch', () => {
    it('should watch individual input', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      expect(result.current.watch('test')).toBeUndefined();

      act(() => {
        result.current.register({ type: 'radio', name: 'test', value: '' });
      });

      // @ts-ignore
      getFieldsValues.mockImplementation(() => {
        return { test: 'data' };
      });

      expect(result.current.watch('test')).toBe('data');
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
        result.current.register({ type: 'radio', name: 'test', value: '' });
        result.current.register({ type: 'radio', name: 'test1', value: '' });
      });

      // @ts-ignore
      getFieldsValues.mockImplementation(() => {
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

      // @ts-ignore
      getFieldsValues.mockImplementation(() => {
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

      // @ts-ignore
      validateField.mockImplementation(async () => {
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

      // @ts-ignore
      validateField.mockImplementation(async () => {
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
        expect(
          await result.current.triggerValidation({ name: 'test' }),
        ).toBeFalsy();
      });
    });

    it('should return true when field is found and validation pass', async () => {
      const { result } = renderHook(() => useForm<{ test: string }>());

      act(() => {
        result.current.register({ type: 'input', name: 'test' });
      });

      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        expect(
          await result.current.triggerValidation({
            name: 'test',
          }),
        ).toBeTruthy();
      });
    });

    it('should update value when value is supplied', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        expect(
          await result.current.triggerValidation({ name: 'test' }),
        ).toBeTruthy();
      });
    });

    it('should set value while trigger a validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.triggerValidation({ name: 'test', value: 'test' });
      });

      const callback = jest.fn(data => {
        expect(data).toEqual({ test: 'test' });
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

  describe('triggerValidation with schema', () => {
    it('should return the error with single field validation', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        }),
      );

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      // @ts-ignore
      validateWithSchema.mockImplementation(async payload => {
        return {
          fieldErrors: payload,
          result: {},
        };
      });

      await act(async () => {
        await result.current.triggerValidation({ name: 'test' });
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

      // @ts-ignore
      validateWithSchema.mockImplementation(async payload => {
        return {
          fieldErrors: payload,
          result: {},
        };
      });

      await act(async () => {
        const resultTrue = await result.current.triggerValidation({
          name: 'test1',
        });
        expect(resultTrue).toEqual(true);
        const resultFalse = await result.current.triggerValidation({
          name: 'test2',
        });
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

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          fieldErrors: {
            test1: 'test',
          },
          result: {},
        };
      });

      await act(async () => {
        await result.current.triggerValidation({ name: 'test' });
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

      act(() => {
        result.current.register(
          { type: 'input', name: 'test' },
          { required: true },
        );
      });

      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          fieldErrors: {
            test1: 'test1',
            test: 'test',
          },
          result: {},
        };
      });

      await act(async () => {
        await result.current.triggerValidation([
          { name: 'test' },
          { name: 'test1' },
        ]);
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

      // @ts-ignore
      validateWithSchema.mockImplementation(async payload => {
        return {
          fieldErrors: payload,
          result: {},
        };
      });

      await act(async () => {
        const resultTrue = await result.current.triggerValidation([
          { name: 'test1' },
          { name: 'test2' },
        ]);
        expect(resultTrue).toEqual(true);

        const resultFalse = await result.current.triggerValidation([
          { name: 'test2' },
          { name: 'test3' },
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

      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          fieldErrors: {
            test1: 'test1',
            test: 'test',
          },
          result: {},
        };
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
      // @ts-ignore
      validateField.mockImplementation(async () => {
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

    it('should only validate fields which have been specified', async () => {
      const { result } = renderHook(() =>
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          validationFields: ['test'],
        }),
      );
      const callback = jest.fn();

      act(() => {
        result.current.register(
          { value: '', type: 'input', name: 'test1' },
          { required: true },
        );
        result.current.register({ value: '', type: 'input', name: 'test' });
      });

      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });

      await act(async () => {
        await result.current.handleSubmit(callback)({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
      expect(validateField).toHaveBeenCalledTimes(1);
    });
  });

  describe('getValues', () => {
    it('should call getFieldsValues and return all values', () => {
      const { result } = renderHook(() => useForm<{ test: string }>());
      act(() => {
        result.current.register({ value: 'test', type: 'input', name: 'test' });
      });
      // @ts-ignore
      getFieldsValues.mockImplementation(async () => {
        return {};
      });
      act(() => {
        result.current.getValues();
      });
      expect(getFieldsValues).toBeCalled();
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

      act(() => {
        result.current.register(
          { value: '', type: 'input', name: 'test' },
          { required: true },
        );
      });
      const callback = jest.fn();
      // @ts-ignore
      getFieldsValues.mockImplementation(async () => {
        return { test: 'test' };
      });
      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          fieldErrors: {},
          result: {},
        };
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
          ref: undefined,
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
          ref: undefined,
        },
      });
    });

    it('should remove error', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      act(() => {
        result.current.setError('input', 'test');
        result.current.clearError('input');
      });
      expect(result.current.errors).toEqual({});
    });
  });

  describe('formState', () => {
    it('should disable isValid for submit mode', () => {
      const { result } = renderHook(() => useForm<{ input: string }>());
      expect(result.current.formState.isValid).toBeTruthy();
    });

    it('should return false for onChange or onBlur mode by default', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onBlur,
        }),
      );

      expect(result.current.formState.isValid).toBeFalsy();
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

      expect(result.current.formState.isValid).toBeFalsy();
    });

    it('should return false when a validated field is invalid', () => {
      const { result } = renderHook(() =>
        useForm<{ input: string }>({
          mode: VALIDATION_MODE.onBlur,
        }),
      );

      act(() => {
        result.current.register({ name: 'one' }, { required: true });
        result.current.register({ name: 'input' });
        result.current.setValue('input', 'x');
      });

      expect(result.current.formState.isValid).toBeFalsy();
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
        useForm<{ test: string }>({
          mode: VALIDATION_MODE.onSubmit,
          defaultValues: {
            test: 'data',
          },
        }),
      );

      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });

      act(() => {
        result.current.register({ type: 'text', name: 'test' });
      });

      // @ts-ignore
      await act(async () => {
        await result.current.handleSubmit((data: any) => {
          expect(data).toEqual({
            test: 'data',
          });
        })({
          preventDefault: () => {},
          persist: () => {},
        } as React.SyntheticEvent);
      });
    });
  });
});
