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

  if (
    (validFields.has(name) && isFieldValid) ||
    (errors[name] && errors[name].isManual) ||
    (isFormValid && isFieldValid)
  ) {
    return false;
  }

  if (
    (fieldsWithValidation.has(name) &&
      !validFields.has(name) &&
      isFieldValid) ||
    (isFormValid && !isFieldValid) ||
    (isFieldValid && errors[name]) ||
    !errors[name]
  ) {
    return true;
  }

  return (
    errors[name] &&
    error[name] &&
    !isSameError(errors[name], error[name].type, error[name].message)
  );
}
