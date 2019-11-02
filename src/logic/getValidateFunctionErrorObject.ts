import isString from '../utils/isString';
import isBoolean from '../utils/isBoolean';
import { INPUT_VALIDATION_RULES } from '../constants';
import { FieldError, ValidateResult, Ref } from '../types';

export default function getValidateFunctionErrorObject(
  result: ValidateResult,
  ref: Ref,
  nativeError: Function,
  type = INPUT_VALIDATION_RULES.validate,
): FieldError | undefined {
  const isStringValue = isString(result);

  if (isStringValue || (isBoolean(result) && !result)) {
    const message = isStringValue ? result : '';
    const error = {
      type,
      message,
      ref,
    };
    nativeError(message);
    return error as FieldError;
  }

  return;
}
