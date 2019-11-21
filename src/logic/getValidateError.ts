import isString from '../utils/isString';
import isBoolean from '../utils/isBoolean';
import { FieldError, Ref } from '../types';

export default function getValidateError(
  result: string | undefined,
  ref: Ref,
  nativeError: Function,
  type = 'validate',
): FieldError | void {
  const isStringValue = isString(result);

  if (isStringValue || (isBoolean(result) && !result)) {
    const message = isStringValue ? result : '';
    const error = {
      type,
      message,
      ref,
    };
    nativeError(message);
    return error;
  }
}
