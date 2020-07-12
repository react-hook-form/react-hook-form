import * as React from 'react';
import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isUndefined from '../utils/isUndefined';
import { InternalFieldName, FieldValues, FieldRefs } from '../types/form';

export default <TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  unmountFieldsStateRef?: React.MutableRefObject<Record<string, any>>,
  search?:
    | InternalFieldName<TFieldValues>
    | InternalFieldName<TFieldValues>[]
    | { nest: boolean },
) => {
  const output = {} as TFieldValues;
  const fields = {
    ...fieldsRef.current,
    ...(unmountFieldsStateRef && unmountFieldsStateRef.current),
  };

  for (const name in fields) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : Array.isArray(search) && search.find((data) => name.startsWith(data)))
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fieldsRef,
        name,
        unmountFieldsStateRef,
      );
    }
  }

  return output;
};
