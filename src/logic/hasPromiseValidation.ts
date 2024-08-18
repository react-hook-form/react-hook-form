import { Field, Validate } from '../types';
import isObject from '../utils/isObject';

const ASYNC_FUNCTION = 'AsyncFunction';

export default (fieldReference: Field['_f']) => {
  if (!fieldReference || !fieldReference.validate) {
    return false;
  }

  if (fieldReference.validate.constructor.name === ASYNC_FUNCTION) {
    return true;
  }

  return !!(
    isObject(fieldReference.validate) &&
    Object.values(fieldReference.validate).find(
      (validateFunction: Validate<unknown, unknown>) =>
        validateFunction.constructor.name === ASYNC_FUNCTION,
    )
  );
};
