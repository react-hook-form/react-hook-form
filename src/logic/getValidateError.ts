import isBoolean from '../utils/isBoolean';
import isMessage from '../utils/isMessage';
import { Error, ValidateResult, Ref } from '../types/form';

export default function getValidateError(
  result: ValidateResult,
  ref: Ref,
  type = 'validate',
): Error | void {
  if (isMessage(result) || (isBoolean(result) && !result)) {
    return {
      type,
      message: isMessage(result) ? result : '',
      ref,
    };
  }
}
