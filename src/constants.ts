import { ValidationMode } from './types';

export const VALIDATION_MODE: ValidationMode = {
  onBlur: 'onBlur',
  onChange: 'onChange',
  onSubmit: 'onSubmit',
};

export const RADIO_INPUT = 'radio';

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

export const regexIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
export const regexIsPlainProp = /^\w*$/;
export const regexPropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
export const regexEscapeChar = /\\(\\)?/g;
