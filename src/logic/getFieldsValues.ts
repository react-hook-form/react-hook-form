import * as React from 'react';
import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import { InternalFieldName, FieldValues, FieldRefs } from '../types/form';

export default <TFieldValues extends FieldValues>(
  fields: React.MutableRefObject<FieldRefs<TFieldValues>>,
  unmountFieldsState?: React.MutableRefObject<Record<string, any>>,
  search?:
    | InternalFieldName<TFieldValues>
    | InternalFieldName<TFieldValues>[]
    | { nest: boolean },
) => {
  const output = {} as TFieldValues;

  for (const name in fields.current) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : isArray(search) && search.find((data) => name.startsWith(data)))
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fields,
        name,
        unmountFieldsState,
      );
    }
  }

  return output;
};
