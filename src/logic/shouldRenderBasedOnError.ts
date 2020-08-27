import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';
import get from '../utils/get';
import {
  FieldValues,
  InternalFieldName,
  FieldErrors,
  FlatFieldErrors,
  FieldNames,
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
  error: FlatFieldErrors<TFieldValues>;
  name: InternalFieldName<TFieldValues>;
  validFields: FieldNames<TFieldValues>;
  fieldsWithValidation: FieldNames<TFieldValues>;
}): boolean {
  const isFieldValid = isEmptyObject(error);
  const isFormValid = isEmptyObject(errors);
  const currentFieldError = get(error, name);
  const existFieldError = get(errors, name);

  if (isFieldValid && get(validFields, name)) {
    return false;
  }

  if (
    isFormValid !== isFieldValid ||
    (!isFormValid && !existFieldError) ||
    (isFieldValid && get(fieldsWithValidation, name) && !get(validFields, name))
  ) {
    return true;
  }

  return currentFieldError && !isSameError(existFieldError, currentFieldError);
}
