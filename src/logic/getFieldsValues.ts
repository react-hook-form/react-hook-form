import * as React from 'react';
import set from '../utils/set';
import { FieldRefs } from '../types';

export default (fieldsRef: React.MutableRefObject<FieldRefs>): any => {
  const output: Record<string, unknown> = {};

  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name]!.__field;

    if (field && !field.ref.disabled) {
      set(output, name, field.value);
    }
  }

  return output;
};
