import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isBoolean from '../utils/isBoolean';
import { FieldError, ValidateResult, Ref } from '../types';

export default function getValidateFunctionErrorObject(
  result: ValidateResult,
  ref: Ref,
  nativeError: Function,
  type = 'validate',
): FieldError | undefined {
  const isStringValue = isString(result);
  const isArrayValue = isArray(result);

  if (isArrayValue || isStringValue || (isBoolean(result) && !result)) {
    const message = isStringValue ? result : '';
    const error = {
      type,
      message,
      ref,
      ...(isArrayValue ? { messages: result } : {}),
    };
    nativeError(message);
    return error as FieldError;
  }

  return;
}
