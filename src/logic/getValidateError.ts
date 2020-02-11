import isString from '../utils/isString';
import isBoolean from '../utils/isBoolean';
import isObject from '../utils/isObject';
import { FieldError, ValidateResult, Ref } from '../types';

export default function getValidateError(
  result: ValidateResult,
  ref?: Ref,
  type = 'validate',
): FieldError | void {
  const isStringValue = isString(result);

  if (
    isStringValue ||
    (isBoolean(result) && !result) ||
    (isObject(result) && Object.keys(result).length)
  ) {
    const message = isStringValue ? (result as string) : '';
    return {
      type,
      message,
      ref,
      result,
    };
  }
}
