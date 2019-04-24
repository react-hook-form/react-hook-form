import * as React from 'react';
import useForm from './';
import { act } from 'react-dom/test-utils';
import attachEventListeners from './logic/attachEventListeners';
import { mount } from 'enzyme';

jest.mock('./utils/onDomRemove', () => ({
  default: () => {},
}));
jest.mock('./logic/attachEventListeners');

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

  // test('should have correct name', () => {
  //   expect(hookForm.name).toBe('name');
  // });
});
