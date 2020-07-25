import * as React from 'react';
import getFieldValue from './getFieldValue';
import isString from '../utils/isString';
import isArray from '../utils/isArray';
import isUndefined from '../utils/isUndefined';
import {
  InternalFieldName,
  FieldValues,
  FieldRefs,
  UnpackNestedValue,
  FieldValue,
} from '../types/form';
import transformToNestObject from './transformToNestObject';
import { DeepPartial } from '../types/utils';

export default <TFieldValues extends FieldValues>(
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>,
  unmountFieldsStateRef: React.MutableRefObject<Record<string, any>>,
  defaultValuesRef: React.MutableRefObject<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >,
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
        : isArray(search) && search.find((data) => name.startsWith(data)))
    ) {
      output[name as InternalFieldName<TFieldValues>] = getFieldValue(
        fieldsRef,
        name,
      );
    }
  }

  return {
    ...transformToNestObject(defaultValuesRef.current),
    ...transformToNestObject(unmountFieldsStateRef.current),
    ...transformToNestObject(output),
  };
};
