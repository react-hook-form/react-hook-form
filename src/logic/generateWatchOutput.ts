import { FieldValues, InternalFieldName, Names } from '../types';
import get from '../utils/get';
import isString from '../utils/isString';

export function generateWatchOutput(
  names: string | string[] | undefined,
  _names: Names,
  formValues?: FieldValues,
  isGlobal?: boolean,
) {
  const isArray = Array.isArray(names);
  if (isString(names)) {
    _names.watch.add(names as InternalFieldName);
    return get(formValues, names as InternalFieldName);
  }

  if (isArray) {
    return names.map(
      (fieldName) => (
        _names.watch.add(fieldName as InternalFieldName),
        get(formValues, fieldName as InternalFieldName)
      ),
    );
  }

  isGlobal && (_names.watchAll = true);
  return formValues;
}
