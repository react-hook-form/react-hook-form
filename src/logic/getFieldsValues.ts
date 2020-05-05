import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { InternalFieldName, FieldValues, FieldRefs } from '../types';

export default <TFieldValues extends FieldValues>(
  fields: FieldRefs<TFieldValues>,
  search?:
    | InternalFieldName<TFieldValues>
    | InternalFieldName<TFieldValues>[]
    | { nest: boolean },
) => {
  const output = {} as TFieldValues;

  for (const name in fields) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : isArray(search)
        ? search.find((data) => name.startsWith(data))
        : search && search.nest)
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fields,
        fields[name]!.ref,
      );
    }
  }

  return output;
};
