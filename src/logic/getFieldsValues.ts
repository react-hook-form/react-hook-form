import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { FieldName, FieldValues, FieldRefs } from '../types';

export default <FormValues extends FieldValues>(
  fields: FieldRefs<FormValues>,
  search?: any,
) => {
  const output = {} as FormValues;
  const isSearchString = isString(search);
  const isSearchArray = isArray(search);
  const isNest = search && search.nest;

  for (const name in fields) {
    if (
      isUndefined(search) ||
      isNest ||
      (isSearchString && name.startsWith(search as string)) ||
      (isSearchArray &&
        (search as string[]).find((data: string) =>
          name.startsWith(data as string),
        ))
    ) {
      output[name as FieldName<FormValues>] = getFieldValue(
        fields,
        fields[name]!.ref,
      );
    }
  }

  return output;
};
