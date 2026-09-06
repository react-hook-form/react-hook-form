import type { Field } from '../types';
import isUndefined from '../utils/isUndefined';

export default (options: Field['_f']) =>
  options.mount &&
  (options.required ||
    (!isUndefined(options.required) && options.required !== false) ||
    !isUndefined(options.min) ||
    !isUndefined(options.max) ||
    !isUndefined(options.maxLength) ||
    !isUndefined(options.minLength) ||
    options.pattern ||
    options.validate);
