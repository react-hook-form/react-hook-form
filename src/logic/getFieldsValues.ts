import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { InternalFieldName, FieldValues, FieldRefs } from '../types/form';
import transformToNestObject from './transformToNestObject';

export default <TFieldValues extends FieldValues>(
  fields: FieldRefs<TFieldValues>,
  unmountFieldsState?: Record<string, any>,
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
        : isArray(search) && search.find((data) => name.startsWith(data)))
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fields,
        name,
      );
    }
  }

  return {
    ...unmountFieldsState,
    ...transformToNestObject(output),
  };
};
