import { Control } from '../types';

export const reconfigureControl = (
  controlOverrides: Partial<Control> = {},
): Control => ({
  unmountFieldsStateRef: {
    current: {},
  },
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
  watchFieldsHookRef: {
    current: {},
  },
  watchFieldsHookRenderRef: {
    current: {},
  },
  watchInternal: jest.fn(),
  validateSchemaIsValid: jest.fn(),
  reRender: jest.fn(),
  setValue: jest.fn(),
  getValues: jest.fn(),
  register: jest.fn(),
  unregister: jest.fn(),
  trigger: jest.fn(),
  removeFieldEventListener: jest.fn(),
  mode: {
    isOnSubmit: false,
    isOnBlur: false,
    isOnChange: false,
    isOnAll: false,
  },
  reValidateMode: {
    isReValidateOnBlur: false,
    isReValidateOnChange: false,
  },
  formStateRef: {
    current: {
      errors: {},
      isDirty: false,
      isSubmitted: false,
      dirtyFields: {},
      submitCount: 0,
      touched: {},
      isSubmitting: false,
      isValid: false,
    },
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
  updateFormState: () => {},
  readFormStateRef: {
    current: {
      isDirty: true,
      errors: true,
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
