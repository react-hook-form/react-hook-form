import get from '../utils/get';
import getPath from '../utils/getPath';
import combineFieldValues from './combineFieldValues';
import { DataType } from '../types';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';

export default (
  fieldValues: DataType,
  fieldName: string,
  watchFields: { [key: string]: boolean },
) => {
  if (isEmptyObject(fieldValues) || isUndefined(fieldValues)) return undefined;
  if (!isUndefined(fieldValues[fieldName])) {
    watchFields[fieldName] = true;
    return fieldValues[fieldName];
  }

  const combinedValues = combineFieldValues(fieldValues);
  const values = get(combinedValues, fieldName);
  if (values !== undefined) {
    const result = getPath(fieldName, values);
    if (Array.isArray(result)) {
      result.forEach(name => {
        watchFields[name as any] = true;
      });
    }
  }
  return values;
};
