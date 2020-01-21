import { Control } from '../../types';

export default (controlOverrides: Partial<Control> = {}): Control => ({
  defaultValuesRef: {
    current: {},
  },
  setValue: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  triggerValidation: jest.fn(),
  errors: {},
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
