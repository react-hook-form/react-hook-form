import combineFieldValues from './combineFieldValues';
import get from '../utils/get';
import getPath from '../utils/getPath';
import isEmptyObject from '../utils/isEmptyObject';
import isUndefined from '../utils/isUndefined';
import { FieldValue, FieldValues, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  fieldValues: FormValues,
  fieldName: FieldName<FormValues>,
  watchFields: Set<FieldName<FormValues>>,
): FieldValue<FormValues> | Partial<FormValues> | undefined => {
  if (isEmptyObject(fieldValues)) {
    return undefined;
  }

  if (!isUndefined(fieldValues[fieldName])) {
    watchFields.add(fieldName);
    return fieldValues[fieldName];
  }

  const values = get(combineFieldValues(fieldValues), fieldName);

  if (!isUndefined(values)) {
    getPath<FormValues>(fieldName, values).forEach(name =>
      watchFields.add(name),
    );
  }

  return values;
};
