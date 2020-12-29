import * as React from 'react';
import isUndefined from '../utils/isUndefined';
import transformToNestObject from './transformToNestObject';
import { InternalFieldName, FieldRefs } from '../types';

export default (
  fieldsRef: React.MutableRefObject<FieldRefs>,
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
      const field = fieldsRef.current[name];

      output[name] = field!.ref.disabled ? undefined : field!.value;
    }
  }

  return transformToNestObject(output);
};
