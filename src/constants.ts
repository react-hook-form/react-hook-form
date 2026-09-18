const blur = 'blur';
const focusout = 'focusout';
const change = 'change';
const submit = 'submit';
const trigger = 'trigger';
const valid = 'valid';

export const EVENTS = {
  BLUR: blur,
  FOCUS_OUT: focusout,
  CHANGE: change,
  SUBMIT: submit,
  TRIGGER: trigger,
  VALID: valid,
} as const;

const onBlur = 'onBlur';
const onChange = 'onChange';
const onSubmit = 'onSubmit';
const onTouched = 'onTouched';
const all = 'all';

export const VALIDATION_MODE = {
  onBlur,
  onChange,
  onSubmit,
  onTouched,
  all,
} as const;

const max = 'max';
const min = 'min';
const maxLength = 'maxLength';
const minLength = 'minLength';
const pattern = 'pattern';
const required = 'required';
const validate = 'validate';

export const INPUT_VALIDATION_RULES = {
  max,
  min,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} as const;

export const REGISTER_VALIDATION_RULES = [
  required,
  min,
  max,
  minLength,
  maxLength,
  pattern,
  validate,
] as const;

export const ROOT_ERROR_TYPE = 'root';

export const PROTOTYPE_KEYWORDS = ['__proto__', 'constructor', 'prototype'];
