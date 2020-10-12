import * as React from 'react';
import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import { deepMerge } from '../utils/deepMerge';
import isUndefined from '../utils/isUndefined';
import { InternalFieldName, FieldValues, FieldRefs } from '../types';
import transformToNestObject from './transformToNestObject';

export default <TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  shallowFieldsStateRef?: React.MutableRefObject<Record<string, any>>,
  excludeDisabled?: boolean,
  search?:
    | InternalFieldName<TFieldValues>
    | InternalFieldName<TFieldValues>[]
    | { nest: boolean },
) => {
  const output = {} as TFieldValues;

  for (const name in fieldsRef.current) {
    if (
      isUndefined(search) ||
      (isString(search)
        ? name.startsWith(search)
        : Array.isArray(search) && search.find((data) => name.startsWith(data)))
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fieldsRef,
        name,
        undefined,
        excludeDisabled,
      );
    }
  }

  return deepMerge(
    transformToNestObject({ ...((shallowFieldsStateRef || {}).current || {}) }),
    transformToNestObject(output),
  );
};
