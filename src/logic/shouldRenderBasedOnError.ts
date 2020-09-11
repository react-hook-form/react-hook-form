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
  const isValid = isUndefined(error);
  const previousError = get(errors, name);

  return (
    (isValid && !!previousError) ||
    (!isValid && !isSameError(previousError, error)) ||
    (isValid && get(fieldsWithValidation, name) && !get(validFields, name))
  );
}
