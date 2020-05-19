import isBoolean from '../utils/isBoolean';
import isMessage from '../utils/isMessage';
import { FieldError, ValidateResult, Ref } from '../types/types';

export default function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = 'validate',
): FieldError | void {
  if (isMessage(result) || (isBoolean(result) && !result)) {
    return {
      type,
      message: isMessage(result) ? result : '',
      ref,
    };
  }
}
