import { ValidationMode } from './types';

export const VALIDATION_MODE: ValidationMode = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
};

export const RADIO_INPUT = 'radio';

export const FILE_INPUT = 'file';

export const VALUE = 'value';

export const UNDEFINED = 'undefined';

export const EVENTS = {
  BLUR: 'blur',
  CHANGE: 'change',
  INPUT: 'input',
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

export const REGEX_IS_DEEP_PROP = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
export const REGEX_IS_PLAIN_PROP = /^\w*$/;
export const REGEX_PROP_NAME = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
export const REGEX_ESCAPE_CHAR = /\\(\\)?/g;
