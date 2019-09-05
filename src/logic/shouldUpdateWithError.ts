import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';

export default function shouldUpdateWithError({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
}: {
  errors: any;
  name: string;
  error: any;
  validFields: Set<unknown>;
  fieldsWithValidation: Set<unknown>;
}): boolean {
  if (fieldsWithValidation.has(name) && !validFields.has(name) && isEmptyObject(error)) {
    return true;
  }

  if (
    (validFields.has(name) && isEmptyObject(error)) ||
    (errors[name] && errors[name].isManual)
  ) {
    return false;
  }

  if (
    (isEmptyObject(errors) && !isEmptyObject(error)) ||
    (isEmptyObject(error) && errors[name]) ||
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
