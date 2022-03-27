import { INPUT_VALIDATION_RULES } from '../constants';
import { Field, FieldError, FieldValues, Ref } from '../types';
import isFunction from '../utils/isFunction';
import isUndefined from '../utils/isUndefined';

import getValidateError from './getValidateError';

export default async function validateFieldArray(
  formValues: FieldValues,
  field?: Field,
): Promise<{ root: FieldError | void }> {
  let rootError;

  if (field && field._f) {
    const { ref, minLength, maxLength, validate } = field._f;

    if (!isUndefined(minLength)) {
      if (formValues.length < minLength) {
        rootError = {
          type: INPUT_VALIDATION_RULES.minLength,
          message: formValues.message,
          ref,
        };
      }
    } else if (!isUndefined(maxLength)) {
      if (formValues.length > maxLength) {
        rootError = {
          type: INPUT_VALIDATION_RULES.maxLength,
          message: formValues.message,
          ref,
        };
      }
    } else if (validate && isFunction(validate)) {
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
