import combineFieldValues from './combineFieldValues';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import isArray from '../utils/isArray';
import { FieldValue } from '../types';

export default <FieldName, FormValues>(
  fieldValues: FormValues,
  fieldName: FieldName | string | (FieldName | string)[],
  watchFields: Partial<Record<keyof FormValues, boolean>>,
): FieldValue | Partial<FormValues> => {
  if (isUndefined(fieldValues) || isEmptyObject(fieldValues)) return undefined;

  if (!isUndefined(fieldValues[fieldName as keyof FormValues])) {
    watchFields[fieldName as keyof FormValues] = true;
    return fieldValues[fieldName as keyof FormValues];
  }

  const values = get(combineFieldValues(fieldValues), fieldName as string);

  if (values !== undefined) {
    const result = getPath<FieldName>(fieldName as string, values);

    if (isArray(result)) {
      result.forEach(name => {
        watchFields[name as keyof FormValues] = true;
      });
    }
  }

  return values;
};
