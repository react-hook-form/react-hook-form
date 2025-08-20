import type { FieldError, Message, Ref, ValidateResult } from '../types';
import isBoolean from '../utils/isBoolean';
import isMessage from '../utils/isMessage';

export default function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = 'validate',
): FieldError | void {
  if (
    isMessage(result) ||
    (Array.isArray(result) && (result as Message[]).every(isMessage)) ||
    (isBoolean(result) && !result)
  ) {
    return {
      type,
      message: isMessage(result) ? result : '',
      ref,
    };
  }
}
