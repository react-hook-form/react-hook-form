import { INPUT_VALIDATION_RULES } from '../constants';
import { Field, FieldError, FieldValues, Ref } from '../types';
import isFunction from '../utils/isFunction';
import isUndefined from '../utils/isUndefined';

import getValidateError from './getValidateError';
import getValueAndMessage from './getValueAndMessage';

export default async function validateFieldArray(
  formValues: FieldValues,
  field?: Field,
): Promise<{ root: FieldError | void }> {
  let rootError;

  if (field && field._f && Array.isArray(formValues)) {
    const { ref, minLength, maxLength, validate } = field._f;

    if (!isUndefined(minLength)) {
      const minOutput = getValueAndMessage(minLength);
      if (formValues.length < minLength) {
        rootError = {
          type: INPUT_VALIDATION_RULES.minLength,
          message: minOutput.message,
          ref,
        };
      }
    } else if (!isUndefined(maxLength)) {
      const maxOutput = getValueAndMessage(maxLength);
      if (formValues.length > maxLength) {
        rootError = {
          type: INPUT_VALIDATION_RULES.maxLength,
          message: maxOutput.message,
          ref,
        };
      }
    } else if (isFunction(validate)) {
      const error = getValidateError(await validate(formValues), {} as Ref);
      if (error) {
        rootError = error;
      }
    }
  }

  return {
    root: rootError,
  };
}
