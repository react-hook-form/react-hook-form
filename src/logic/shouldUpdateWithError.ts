import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';
import get from '../utils/get';
import { FieldValues, FieldName, FieldErrors } from '../types';

export default function shouldUpdateWithError<FormValues extends FieldValues>({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
}: {
  errors: FieldErrors<FormValues>;
  error: FieldErrors<FormValues>;
  name: FieldName<FormValues>;
  validFields: Set<FieldName<FormValues>>;
  fieldsWithValidation: Set<FieldName<FormValues>>;
}): boolean {
  const isFieldValid = isEmptyObject(error);
  const isFormValid = isEmptyObject(errors);
  const currentFieldError = get(error, name);
  const existFieldError = get(error, name);

  if (
    (isFieldValid && validFields.has(name)) ||
    (existFieldError && existFieldError.isManual)
  ) {
    return false;
  }

  if (
    isFormValid !== isFieldValid ||
    (!isFormValid && !existFieldError) ||
    (isFieldValid && fieldsWithValidation.has(name) && !validFields.has(name))
  ) {
    return true;
  }

  return (
    currentFieldError &&
    !isSameError(
      existFieldError,
      currentFieldError.type,
      currentFieldError.message,
    )
  );
}
