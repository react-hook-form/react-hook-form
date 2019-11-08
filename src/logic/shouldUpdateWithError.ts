import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';
import { FieldValues, FieldName, FieldErrors } from '../types';

export default function shouldUpdateWithError<FormValues extends FieldValues>({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
  schemaErrors,
}: {
  errors: FieldErrors<FormValues>;
  error: FieldErrors<FormValues>;
  schemaErrors: FieldErrors<FormValues> | boolean;
  name: FieldName<FormValues>;
  validFields: Set<FieldName<FormValues>>;
  fieldsWithValidation: Set<FieldName<FormValues>>;
}): boolean {
  const isFieldValid = isEmptyObject(error);
  const isFormValid = isEmptyObject(errors);
  const currentFieldError = error[name];
  const existFieldError = errors[name];

  if (
    (isFieldValid && validFields.has(name)) ||
    (existFieldError && existFieldError.isManual)
  ) {
    return false;
  }

  if (
    isFormValid !== isFieldValid ||
    (!isFormValid && !existFieldError) ||
    (isFieldValid &&
      fieldsWithValidation.has(name) &&
      !validFields.has(name)) ||
    (schemaErrors && isEmptyObject(schemaErrors) !== isFormValid)
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
