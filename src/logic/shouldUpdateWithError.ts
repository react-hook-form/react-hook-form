import isEmptyObject from '../utils/isEmptyObject';
import isSameError from '../utils/isSameError';

// Todo: improve the types in this file
export default function shouldUpdateWithError<FieldName>({
  errors,
  name,
  error,
  validFields,
  fieldsWithValidation,
}: {
  errors: any;
  error: any;
  name: FieldName;
  validFields: Set<FieldName>;
  fieldsWithValidation: Set<FieldName>;
}): boolean {
  if (
    (validFields.has(name) && isEmptyObject(error)) ||
    (errors[name] && errors[name].isManual)
  ) {
    return false;
  }

  if (
    (fieldsWithValidation.has(name) &&
      !validFields.has(name) &&
      isEmptyObject(error)) ||
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
