import { ValidationMode } from './types';

export const EVENTS = {
  BLUR: 'blur',
  CHANGE: 'change',
  INPUT: 'input',
};

export const VALIDATION_MODE: ValidationMode = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
  onTouched: 'onTouched',
  all: 'all',
};

export const SELECT = 'select';

export const UNDEFINED = 'undefined';

export const INPUT_VALIDATION_RULES = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
};
