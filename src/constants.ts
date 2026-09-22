export const EVENTS = {
  BLUR: 'blur',
  FOCUS_OUT: 'focusout',
  CHANGE: 'change',
  SUBMIT: 'submit',
  MOUNT: 'mount',
  TRIGGER: 'trigger',
  VALID: 'valid',
} as const;

export const VALIDATION_MODE = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
  onTouched: 'onTouched',
  all: 'all',
} as const;

export const INPUT_VALIDATION_RULES = {
  max: 'max',
  min: 'min',
  maxLength: 'maxLength',
  minLength: 'minLength',
  pattern: 'pattern',
  required: 'required',
  validate: 'validate',
} as const;

export const REGISTER_VALIDATION_RULES = [
  INPUT_VALIDATION_RULES.required,
  INPUT_VALIDATION_RULES.min,
  INPUT_VALIDATION_RULES.max,
  INPUT_VALIDATION_RULES.minLength,
  INPUT_VALIDATION_RULES.maxLength,
  INPUT_VALIDATION_RULES.pattern,
  INPUT_VALIDATION_RULES.validate,
] as const;

export const FORM_ERROR_TYPE = 'form';

export const ROOT_ERROR_TYPE = 'root';

export const PROTOTYPE_KEYWORDS = ['__proto__', 'constructor', 'prototype'];
