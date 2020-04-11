import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { FieldName, FieldValues, FieldRefs } from '../types';

export default <FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
  search?: FieldName<FormValues> | FieldName<FormValues>[] | { nest: boolean },
) => {
  const output = {} as FormValues;

  for (const name in fields) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : isArray(search)
        ? search.find((data) => name.startsWith(data))
        : search && search.nest)
    ) {
      output[name as FieldName<FormValues>] = getFieldValue(
        fields,
        fields[name]!.ref,
      );
    }
  }

  return output;
};
