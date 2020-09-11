import isSameError from '../utils/isSameError';
import get from '../utils/get';
import isUndefined from '../utils/isUndefined';
import {
  FieldValues,
  InternalFieldName,
  FieldErrors,
  FieldNamesMarkedBoolean,
  FieldError,
} from '../types';

export default function shouldRenderBasedOnError<
  TFieldValues extends FieldValues
>({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
}: {
  errors: FieldErrors<TFieldValues>;
  error: FieldError | undefined;
  name: InternalFieldName<TFieldValues>;
  validFields: FieldNamesMarkedBoolean<TFieldValues>;
  fieldsWithValidation: FieldNamesMarkedBoolean<TFieldValues>;
}): boolean {
  const isFieldValid = isUndefined(error);
  const existFieldError = get(errors, name);

  if (isFieldValid && get(validFields, name)) {
    return false;
  }

  if (
    (existFieldError && isFieldValid) ||
    (isFieldValid && get(fieldsWithValidation, name) && !get(validFields, name))
  ) {
    return true;
  }

  return !isFieldValid && !isSameError(existFieldError, error);
}
