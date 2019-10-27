import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';
import isUndefined from '../utils/isUndefined';
import { FieldValues, FieldName, FieldErrors } from '../types';

export default function shouldUpdateWithError<FormValues extends FieldValues>({
  errors,
  name,
  error,
  validFields,
  schemaErrors,
}: {
  errors: FieldErrors<FormValues>;
  error: FieldErrors<FormValues>;
  schemaErrors: FieldErrors<FormValues> | undefined;
  name: FieldName<FormValues>;
  validFields: Set<FieldName<FormValues>>;
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
    isFormValid !== isFieldValid ||
    (!isFormValid && !existFieldError) ||
    (!isUndefined(schemaErrors) && isEmptyObject(schemaErrors) !== isFormValid)
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
