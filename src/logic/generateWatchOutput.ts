import { FieldValues, Names } from '../types';
import get from '../utils/get';
import isString from '../utils/isString';

export default (
  names: string | string[] | undefined,
  _names: Names,
  formValues?: FieldValues,
  isGlobal?: boolean,
) => {
  if (isString(names)) {
    isGlobal && _names.watch.add(names);
    return get(formValues, names);
  }

  if (Array.isArray(names)) {
    return names.map(
      (fieldName) => (
        isGlobal && _names.watch.add(fieldName), get(formValues, fieldName)
      ),
    );
  }

  _names.watchAll = !!isGlobal;

  return formValues;
};
