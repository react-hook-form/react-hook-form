import { ValidationMode } from './types';

export const EVENTS = {
  FOCUS: 'focus',
  FOCUS_IN: 'focusin',
  BLUR: 'blur',
  FOCUS_OUT: 'focusout',
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
