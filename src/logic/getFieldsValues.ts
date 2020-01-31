import getFieldValue from './getFieldValue';
import { FieldName, FieldValues, FieldRefs } from '../types';
import isString from '../utils/isString';

export default <FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
  search?: any,
) => {
  const output = {} as FormValues;
  const isSearchString = isString(search);

  for (const name in fields) {
    if (!isSearchString || (isSearchString && name.startsWith(search))) {
      output[name as FieldName<FormValues>] = getFieldValue(
        fields,
        (fields[name] || {}).ref,
      );
    }
  }

  return output;
};
