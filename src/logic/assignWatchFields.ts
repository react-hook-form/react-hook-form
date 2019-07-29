import get from '../utils/get';
import getPath from '../utils/getPath';
import combineFieldValues from './combineFieldValues';
import { DataType } from '../types';

export default (
  fieldValues: DataType,
  fieldName: string,
  watchFields: { [key: string]: boolean },
) => {
  if (fieldValues[fieldName]) {
    watchFields[fieldName] = true;
    return fieldValues[fieldName];
  }

  const combinedValues = combineFieldValues(fieldValues);
  const values = get(combinedValues, fieldName);
  if (values === undefined) {
    getPath(fieldName, values).forEach(name => {
      watchFields[name as any] = true;
    });
  }
  return values;
};
