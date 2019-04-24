import * as React from 'react';
import useForm from './';
import { act } from 'react-dom/test-utils';
import attachEventListeners from './logic/attachEventListeners';
import getFieldsValues from './logic/getFieldsValues';
import findMissDomAndClean from './logic/findMissDomAndClean';
import { mount } from 'enzyme';

jest.mock('./utils/onDomRemove', () => ({
  default: () => {},
}));
jest.mock('./logic/findMissDomAndClean');
jest.mock('./logic/attachEventListeners');
jest.mock('./logic/getFieldsValues');

const TestHook = ({ callback }) => {
  callback();
  return null;
};

export const testHook = callback => {
  mount(<TestHook callback={callback} />);
};

let hookForm;
beforeEach(() => {
  testHook(() => {
    hookForm = useForm();
  });
});

describe('useForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    it('should return undefined when ref is undefined', () => {
      expect(hookForm.register(undefined)).toBeUndefined();
    });

    it('should return undefined when ref name is missing', () => {
      expect(hookForm.register({ type: 'input' })).toBeUndefined();
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
          required: false,
          validate: undefined,
        },
        isRadio: false,
        validateAndStateUpdate: expect.any(Function),
      });
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
          required: false,
          validate: undefined,
        },
        isRadio: true,
        validateAndStateUpdate: expect.any(Function),
      });
    });
  });

  describe('watch', () => {
    it('should watch individual input', () => {
      expect(hookForm.watch('test')).toBeUndefined();
      // @ts-ignore
      getFieldsValues.mockImplementation((_, name) => {
        if (name === 'test') {
          return 'data';
        }
      });
      expect(hookForm.watch('test')).toBe('data');
    });

    it('should watch array of inputs', () => {
      expect(hookForm.watch(['test', 'test1'])).toBeUndefined();
      // @ts-ignore
      getFieldsValues.mockImplementation((_, name) => {
        if (name && name.includes('test1') && name.includes('test')) {
          return ['data1', 'data2'];
        }
      });
      expect(hookForm.watch(['test', 'test1'])).toEqual(['data1', 'data2']);
    });

    it('should watch every fields', () => {
      expect(hookForm.watch()).toBeUndefined();
      // @ts-ignore
      getFieldsValues.mockImplementation((_, name) => {
        if (name === undefined) {
          return ['data1', 'data2'];
        }
      });
      expect(hookForm.watch()).toEqual(['data1', 'data2']);
    });
  });

  describe('unSubscribe', () => {
    it('should remove all reference when mode change', () => {
      hookForm.register({ type: 'input', name: 'test' });
      expect(attachEventListeners).toBeCalledWith({
        field: {
          mutationWatcher: undefined,
          ref: {
            name: 'test',
            type: 'input',
          },
          required: false,
          validate: undefined,
        },
        isRadio: false,
        validateAndStateUpdate: expect.any(Function),
      });
      hookForm.register({ type: 'input', name: 'test' });
      act(() => {
        hookForm.unSubscribe();
      });
      expect(findMissDomAndClean).toBeCalled();
      hookForm.register({ type: 'input', name: 'test' });
      expect(attachEventListeners).toBeCalledTimes(2);
    });
  });
});
