import { ValidationMode } from './types';

export const EVENTS = {
  BLUR: 'blur',
  CHANGE: 'change',
};

export const VALIDATION_MODE: ValidationMode = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
  onTouched: 'onTouched',
  all: 'all',
};

export const INPUT_VALIDATION_RULES = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
};

const noop = () => {};

const subscribeNoop = {
  next: noop,
  subscribe: noop,
};

export const CONTROL_DEFAULT = {
  register: noop,
  _getWatch: noop,
  _removeUnmounted: noop,
  _updateFieldArray: noop,
  _getFieldArray: noop,
  _subjects: {
    watch: subscribeNoop,
    state: subscribeNoop,
    array: subscribeNoop,
  },
  _proxyFormState: {},
  _formValues: {},
  _stateFlags: {},
  _names: {
    watch: new Set(),
    array: new Set(),
  },
  _options: {},
};
