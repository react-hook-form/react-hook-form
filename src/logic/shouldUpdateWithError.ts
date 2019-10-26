import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';
import { FieldValues, FieldName } from '../types';

// TODO: improve the types in this file
export default function shouldUpdateWithError<FormValues extends FieldValues>({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
}: {
  errors: any;
  error: any;
  name: FieldName<FormValues>;
  validFields: Set<FieldName<FormValues>>;
  fieldsWithValidation: Set<FieldName<FormValues>>;
}): boolean {
  const isFieldValid = isEmptyObject(error);
  const isFormValid = isEmptyObject(errors);
  const currentFieldError = error[name];
  const existFieldError = errors[name];

  if (
    (validFields.has(name) && isFieldValid) ||
    (existFieldError && existFieldError.isManual)
  ) {
    return false;
  }

  if (
    (fieldsWithValidation.has(name) &&
      !validFields.has(name) &&
      isFieldValid) ||
    (isFormValid && !isFieldValid) ||
    (isFieldValid && !isFormValid) ||
    (!isFormValid && !existFieldError)
  ) {
    return true;
  }

  return (
    existFieldError &&
    currentFieldError &&
    !isSameError(
      existFieldError,
      currentFieldError.type,
      currentFieldError.message,
    )
  );
}
