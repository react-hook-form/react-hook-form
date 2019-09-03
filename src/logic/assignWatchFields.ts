import combineFieldValues from './combineFieldValues';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import { FieldValues } from '../types';

export default (
  fieldValues: FieldValues,
  fieldName: string,
  watchFields: { [key: string]: boolean },
) => {
  if (isUndefined(fieldValues) || isEmptyObject(fieldValues)) return undefined;

  if (!isUndefined(fieldValues[fieldName])) {
    watchFields[fieldName] = true;
    return fieldValues[fieldName];
  }

  const values = get(combineFieldValues(fieldValues), fieldName);

  if (values !== undefined) {
    const result = getPath(fieldName, values);

    if (Array.isArray(result)) {
      result.forEach(name => {
        watchFields[name] = true;
      });
    }
  }

  return values;
};
