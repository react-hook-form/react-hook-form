import isString from '../utils/isString';
import isBoolean from '../utils/isBoolean';
import { INPUT_VALIDATION_RULES } from '../constants';
import { FieldError, ValidateResult, Ref } from '../types';

export default (
  result: ValidateResult,
  ref: Ref,
  nativeError: Function,
  type = INPUT_VALIDATION_RULES.validate,
): FieldError | void => {
  if (isString(result) || (isBoolean(result) && !result)) {
    const message = isString(result) ? result : '';
    nativeError(message);

    return {
      type,
      message,
      ref,
    };
  }
};
