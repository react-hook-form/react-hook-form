import * as React from 'react';
import transformToNestObject from './transformToNestObject';
import { FieldRefs } from '../types';

export default (fieldsRef: React.MutableRefObject<FieldRefs>) => {
  const output: Record<string, unknown> = {};

  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name]!.__field;

    if (field && !field.ref.disabled) {
      output[name] = field.value;
    }
  }

  return transformToNestObject(output);
};
