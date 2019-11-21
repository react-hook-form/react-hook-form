import isString from '../utils/isString';
import isBoolean from '../utils/isBoolean';
import { FieldError, ValidateResult, Ref } from '../types';

export default function getValidateError(
  result: ValidateResult,
  ref: Ref,
  nativeError: Function,
  type = 'validate',
): FieldError | void {
  const isStringValue = isString(result);

  if (isStringValue || (isBoolean(result) && !result)) {
    const message = isStringValue ? (result as string) : '';
    const error = {
      type,
      message,
      ref,
    };
    nativeError(message);
    return error;
  }
}
