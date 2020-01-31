import getFieldValue from './getFieldValue';
import { FieldValues, FieldRefs } from '../types';
import isString from '../utils/isString';

export default <FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
  search?: any,
) => {
  const output: Record<string, FormValues> = {};

  for (const name in fields) {
    if (!search || (isString(search) && name.startsWith(search))) {
      output[name] = getFieldValue(fields, (fields[name] || {}).ref);
    }
  }

  return output as FormValues;
};
