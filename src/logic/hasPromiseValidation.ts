import type { Field } from '../types';
import isFunction from '../utils/isFunction';
import isObject from '../utils/isObject';

const ASYNC_FUNCTION = 'AsyncFunction';

export default (fieldReference: Field['_f']) => {
  if (!fieldReference || !fieldReference.validate) return false;

  if (isFunction(fieldReference.validate)) {
    return fieldReference.validate.constructor.name === ASYNC_FUNCTION;
  }

  if (isObject(fieldReference.validate)) {
    for (const key in fieldReference.validate) {
      if (fieldReference.validate[key].constructor.name === ASYNC_FUNCTION) {
        return true;
      }
    }
  }

  return false;
};
