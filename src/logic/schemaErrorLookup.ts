import { FieldError, FieldErrors, FieldValues } from '../types';
import get from '../utils/get';
import isKey from '../utils/isKey';

export default function schemaErrorLookup(
  errors: FieldErrors,
  _fields: FieldValues,
  name: string,
): {
  error?: FieldError;
  name: string;
} {
  const error = get(errors, name);

  if (error || isKey(name)) {
    return {
      error,
      name,
    };
  }

  const names = name.split('.');

  while (names.length) {
    const fieldName = names.join('.');
    const field = get(_fields, fieldName);
    const foundError = get(errors, fieldName);

    if (field) {
      return { name };
    }

    if (foundError && !field && foundError.type) {
      return {
        name: fieldName,
        error: foundError,
      };
    }

    names.pop();
  }

  return {
    name,
  };
}
