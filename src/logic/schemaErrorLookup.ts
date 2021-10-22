import { FieldError, FieldErrors } from '../types';
import get from '../utils/get';
import isKey from '../utils/isKey';

export default function schemaErrorLookup(
  errors: FieldErrors,
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
    const name = names.join('.');
    const foundError = get(errors, name);
    if (foundError && foundError.type) {
      return {
        name,
        error: foundError,
      };
    }
    names.pop();
  }

  return {
    name,
  };
}
