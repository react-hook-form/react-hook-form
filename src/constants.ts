import { ValidationMode } from './types/form';

export const VALIDATION_MODE: ValidationMode = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
  all: 'all',
};

export const VALUE = 'value';

export const UNDEFINED = 'undefined';

export const EVENTS = {
  BLUR: 'blur',
  CHANGE: 'change',
  INPUT: 'input',
};

export const SELECT = 'select';

export const INPUT_VALIDATION_RULES = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
};
