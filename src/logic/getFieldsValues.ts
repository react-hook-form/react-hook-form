import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { FieldName, FieldValues, FieldRefs } from '../types';

export default <TFieldValues extends FieldValues>(
  fields: FieldRefs<TFieldValues>,
  search?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
) => {
  const output = {} as TFieldValues;

  for (const name in fields) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : isArray(search) && search.find(name.startsWith))
    ) {
      output[name as FieldName<TFieldValues>] = getFieldValue(
        fields,
        fields[name]!.ref,
      );
    }
  }

  return output;
};
