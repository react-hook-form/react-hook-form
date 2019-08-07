import * as React from 'react';
import useForm from './';
import attachEventListeners from './logic/attachEventListeners';
import getFieldsValues from './logic/getFieldsValues';
import findRemovedFieldAndRemoveListener from './logic/findRemovedFieldAndRemoveListener';
import validateWithSchema from './logic/validateWithSchema';
import validateField from './logic/validateField';
import onDomRemove from './utils/onDomRemove';
import { mount } from 'enzyme';
import { VALIDATION_MODE } from './constants';

jest.mock('./utils/onDomRemove');
jest.mock('./logic/findRemovedFieldAndRemoveListener');
jest.mock('./logic/validateField');
jest.mock('./logic/attachEventListeners');
jest.mock('./logic/getFieldsValues');
jest.mock('./logic/validateWithSchema');

let hookForm: any;
let hookFormWithValidationSchema: any;
let wrapper: any;

const testComponent = (callback: any) => {
  const TestHook = ({ callback }: any) => {
    const { errors } = callback();
    return errors ? <div>errors</div> : null;
  };

  wrapper = mount(<TestHook callback={callback} />);
};

describe('useForm', () => {
  beforeEach(() => {
    testComponent(() => {
      hookForm = useForm();
      return hookForm;
    });

    jest.resetAllMocks();
  });

  describe('register', () => {
    it('should return undefined when ref is undefined', () => {
      expect(hookForm.register(undefined)).toBeUndefined();
    });

    it('should return undefined when ref name is missing', () => {
      expect(hookForm.register({ type: 'input' }, {})).toBeUndefined();
    });

    it('should register field and call attachEventListeners method', () => {
      hookForm.register({ type: 'input', name: 'test' });
      expect(attachEventListeners).toBeCalledWith({
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
      expect(onDomRemove).toBeCalled();
    });

    it('should register field for radio type and call attachEventListeners method', () => {
      hookForm.register({ type: 'radio', name: 'test' });
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
      hookForm.register({ required: true })({
        type: 'text',
        name: 'test',
        value: 'testData',
      });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      await hookForm.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'testData',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      });
    });

    it('should not register the same radio input', async () => {
      hookForm.register({ type: 'radio', name: 'test', value: '' });
      hookForm.register({ type: 'radio', name: 'test', value: '' });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      await hookForm.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: '',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      });
    });
  });

  describe('watch', () => {
    it('should watch individual input', () => {
      expect(hookForm.watch('test')).toBeUndefined();
      hookForm.register({ type: 'radio', name: 'test', value: '' });
      // @ts-ignore
      getFieldsValues.mockImplementation(() => {
        return { test: 'data' };
      });
      expect(hookForm.watch('test')).toBe('data');
    });

    it('should watch array of inputs', () => {
      expect(hookForm.watch(['test', 'test1'])).toEqual({
        test: undefined,
        test1: undefined,
      });
      hookForm.register({ type: 'radio', name: 'test', value: '' });
      hookForm.register({ type: 'radio', name: 'test1', value: '' });
      // @ts-ignore
      getFieldsValues.mockImplementation(() => {
        return {
          test: 'data1',
          test1: 'data2',
        };
      });
      expect(hookForm.watch(['test', 'test1'])).toEqual({
        test: 'data1',
        test1: 'data2',
      });
    });

    it('should watch every fields', () => {
      expect(hookForm.watch()).toEqual({});
      hookForm.register({ type: 'radio', name: 'test', value: '' });
      hookForm.register({ type: 'radio', name: 'test1', value: '' });
      // @ts-ignore
      getFieldsValues.mockImplementation(() => {
        return {
          test: 'data1',
          test1: 'data2',
        };
      });
      expect(hookForm.watch()).toEqual({
        test: 'data1',
        test1: 'data2',
      });
    });
  });

  describe('reset', () => {
    it('should reset the form and re-render the form', async () => {
      hookForm.register({ name: 'test' });
      hookForm.setValue('test', 'data');
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      hookForm.register({ type: 'text', name: 'test' });
      await hookForm.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'data',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      });
      expect(hookForm.formState.isSubmitted).toBeTruthy();
      hookForm.reset();
      expect(hookForm.formState.isSubmitted).toBeFalsy();
    });
  });

  describe('setValue', () => {
    it('should set value of radio input correctly', async () => {
      hookForm.register({ name: 'test', type: 'radio', value: '1' });
      hookForm.register({ name: 'test', type: 'radio', value: '2' });
      hookForm.setValue('test', '1');
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      hookForm.register({ type: 'text', name: 'test' });
      await hookForm.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: '1',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      });
    });

    it('should return undefined when filed not found', () => {
      expect(hookForm.setValue('test', '1')).toBeUndefined();
    });
  });

  describe('triggerValidation', () => {
    it('should return false when field is not found', async () => {
      expect(await hookForm.triggerValidation({ name: 'test' })).toBeFalsy();
    });

    it('should return true when field is found and validation pass', async () => {
      hookForm.register({ type: 'input', name: 'test' });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      expect(
        await hookForm.triggerValidation({
          name: 'test',
        }),
      ).toBeTruthy();
    });

    it('should update value when value is supplied', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
        });
        return hookForm;
      });
      hookForm.register({ type: 'input', name: 'test' }, { required: true });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      expect(await hookForm.triggerValidation({ name: 'test' })).toBeTruthy();
    });

    it('should set value while trigger a validation', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
        });
        return hookForm;
      });
      hookForm.register({ type: 'input', name: 'test' }, { required: true });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      await hookForm.triggerValidation({ name: 'test', value: 'test' });
      const callback = jest.fn(data => {
        expect(data).toEqual({ test: 'test' });
      });
      await hookForm.handleSubmit(callback)();
      expect(callback).toBeCalled();
    });
  });

  describe('triggerValidation with schema', () => {
    it('should return the error with single field validation', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        });
        return hookForm;
      });

      hookForm.register({ type: 'input', name: 'test' }, { required: true });
      // @ts-ignore
      validateWithSchema.mockImplementation(async payload => {
        return payload;
      });
      await hookForm.triggerValidation({ name: 'test' });
      expect(hookForm.errors).toEqual({ test: 'test' });
    });

    it('should return the status of the requested field with single field validation', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
          validationSchema: {
            test2: 'test2',
          },
        });
        return hookForm;
      });

      hookForm.register({ type: 'input', name: 'test1' }, { required: false });
      hookForm.register({ type: 'input', name: 'test2' }, { required: true });
      // @ts-ignore
      validateWithSchema.mockImplementation(async payload => {
        return payload;
      });
      const resultTrue = await hookForm.triggerValidation({ name: 'test1' });
      expect(resultTrue).toEqual(true);
      const resultFalse = await hookForm.triggerValidation({ name: 'test2' });
      expect(resultFalse).toEqual(false);
      expect(hookForm.errors).toEqual({
        test2: 'test2',
      });
    });

    it('should not trigger any error when schema validation result not found', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        });
        return hookForm;
      });

      hookForm.register({ type: 'input', name: 'test' }, { required: true });
      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          test1: 'test',
        };
      });
      await hookForm.triggerValidation({ name: 'test' });
      expect(hookForm.errors).toEqual({});
    });

    it('should support array of fields for schema validation', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
          validationSchema: {},
        });
        return hookForm;
      });

      hookForm.register({ type: 'input', name: 'test' }, { required: true });
      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          test1: 'test1',
          test: 'test',
        };
      });
      await hookForm.triggerValidation([{ name: 'test' }, { name: 'test1' }]);
      expect(hookForm.errors).toEqual({
        test: 'test',
        test1: 'test1',
      });
    });

    it('should return the status of the requested fields with array of fields for validation', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
          validationSchema: {
            test3: 'test3',
          },
        });
        return hookForm;
      });

      hookForm.register({ type: 'input', name: 'test1' }, { required: false });
      hookForm.register({ type: 'input', name: 'test2' }, { required: false });
      hookForm.register({ type: 'input', name: 'test3' }, { required: true });
      // @ts-ignore
      validateWithSchema.mockImplementation(async payload => {
        return payload;
      });
      const resultTrue = await hookForm.triggerValidation([
        { name: 'test1' },
        { name: 'test2' },
      ]);
      expect(resultTrue).toEqual(true);
      const resultFalse = await hookForm.triggerValidation([
        { name: 'test2' },
        { name: 'test3' },
      ]);
      expect(resultFalse).toEqual(false);
      expect(hookForm.errors).toEqual({
        test3: 'test3',
      });
    });

    it('should validate all fields when pass with undefined', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onChange,
          validationSchema: { test: 'test' },
        });
        return hookForm;
      });

      hookForm.register({ type: 'input', name: 'test' }, { required: true });
      hookForm.register({ type: 'input', name: 'test1' }, { required: true });
      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {
          test1: 'test1',
          test: 'test',
        };
      });
      await hookForm.triggerValidation();
      expect(hookForm.errors).toEqual({
        test: 'test',
        test1: 'test1',
      });
    });
  });

  describe('handleSubmit', () => {
    it('should invoke the callback when validation pass', async () => {
      const callback = jest.fn();
      const preventDefault = jest.fn();
      const persist = jest.fn();
      await hookForm.handleSubmit(callback)({
        preventDefault,
        persist,
      });
      expect(callback).toBeCalled();
    });

    it('should not invoke callback when there are errors', async () => {
      hookForm.register(
        { value: '', type: 'input', name: 'test' },
        { required: true },
      );
      const callback = jest.fn();
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return { test: { type: 'test' } };
      });
      await hookForm.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      });
      expect(callback).not.toBeCalled();
    });

    it('should only validate fields which have been specified', async () => {
      const callback = jest.fn();
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onSubmit,
          validationFields: ['test'],
        });
        return hookForm;
      });
      hookForm.register(
        { value: '', type: 'input', name: 'test1' },
        { required: true },
      );
      hookForm.register({ value: '', type: 'input', name: 'test' });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      await hookForm.handleSubmit(callback)();
      expect(validateField).toHaveBeenCalledTimes(1);
    });
  });

  describe('getValues', () => {
    it('should call getFieldsValues and return all values', () => {
      hookForm.register({ value: 'test', type: 'input', name: 'test' });
      // @ts-ignore
      getFieldsValues.mockImplementation(async () => {
        return {};
      });
      hookForm.getValues();
      expect(getFieldsValues).toBeCalled();
    });
  });

  describe('handleSubmit with validationSchema', () => {
    it('should invoke callback when error not found', async () => {
      testComponent(() => {
        hookFormWithValidationSchema = useForm({
          mode: VALIDATION_MODE.onSubmit,
          validationSchema: {},
        });
        return hookFormWithValidationSchema;
      });

      hookFormWithValidationSchema.register(
        { value: '', type: 'input', name: 'test' },
        { required: true },
      );
      const callback = jest.fn();
      // @ts-ignore
      getFieldsValues.mockImplementation(async () => {
        return { test: 'test' };
      });
      // @ts-ignore
      validateWithSchema.mockImplementation(async () => {
        return {};
      });
      await hookFormWithValidationSchema.handleSubmit(callback)({
        preventDefault: () => {},
        persist: () => {},
      });
      expect(callback).toBeCalled();
    });
  });

  describe('setError', () => {
    it('should only set an error when it is not existed', () => {
      hookForm.setError('input', 'test');
      expect(hookForm.errors).toEqual({
        input: {
          type: 'test',
          isManual: true,
          message: undefined,
          ref: undefined,
        },
      });
      hookForm.setError('input', 'test');
      expect(hookForm.errors).toEqual({
        input: {
          type: 'test',
          isManual: true,
          message: undefined,
          ref: undefined,
        },
      });
    });

    it('should remove error', () => {
      hookForm.setError('input', 'test');
      hookForm.clearError('input');
      expect(hookForm.errors).toEqual({});
    });
  });

  describe('formState', () => {
    it('should disable isValid for submit mode', () => {
      expect(hookForm.formState.isValid).toBeTruthy();
    });

    it('should return false for onChange or onBlur mode by default', () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onBlur,
        });
        return hookForm;
      });

      expect(hookForm.formState.isValid).toBeFalsy();
    });

    it('should return true when no validation is registered', () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onBlur,
        });
        return hookForm;
      });
      hookForm.register({ type: 'text', name: 'test' });

      expect(hookForm.formState.isValid).toBeFalsy();
    });
  });

  describe('when component unMount', () => {
    it('should call unSubscribe', () => {
      hookForm.register({ type: 'text', name: 'test' });
      wrapper.unmount();
      expect(findRemovedFieldAndRemoveListener).toBeCalled();
    });
  });

  describe('when defaultValues is supplied', () => {
    it('should populate the input with them', async () => {
      testComponent(() => {
        hookForm = useForm({
          mode: VALIDATION_MODE.onSubmit,
          defaultValues: {
            test: 'data',
          },
        });
        return hookForm;
      });
      // @ts-ignore
      validateField.mockImplementation(async () => {
        return {};
      });
      hookForm.register({ type: 'text', name: 'test' });
      await hookForm.handleSubmit((data: any) => {
        expect(data).toEqual({
          test: 'data',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      });
    });
  });
});
