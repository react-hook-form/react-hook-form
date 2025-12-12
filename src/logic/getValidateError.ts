import type { FieldError, Ref, ValidateResult } from '../types';
import isBoolean from '../utils/isBoolean';
import isString from '../utils/isString';

export function hasError(result: ValidateResult) {
  return (
    (Array.isArray(result) && result.every(isString)) ||
    (isBoolean(result) && !result)
  );
}

export default function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = 'validate',
): FieldError | void {
  if (hasError(result)) {
    return {
      type,
      message: isString(result) ? result : '',
      ref,
    };
  }
}
