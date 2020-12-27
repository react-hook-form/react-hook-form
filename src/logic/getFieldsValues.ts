import * as React from 'react';
import getFieldValue from './getFieldValue';
import isUndefined from '../utils/isUndefined';
import transformToNestObject from './transformToNestObject';
import { InternalFieldName, FieldRefs } from '../types';

export default (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  excludeDisabled?: boolean,
  search?: InternalFieldName | InternalFieldName[],
) => {
  const output: Record<string, unknown> = {};

  for (const name in fieldsRef.current) {
    if (
      isUndefined(search) ||
      (Array.isArray(search) ? search : [search]).find((data) =>
        name.startsWith(data),
      )
    ) {
      output[name] = getFieldValue(fieldsRef.current[name], excludeDisabled);
    }
  }

  return transformToNestObject(output);
};
