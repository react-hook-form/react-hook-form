import * as React from 'react';
import set from '../utils/set';
import { FieldRefs } from '../types';

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  output: Record<string, any> = {},
): any => {
  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name];

    if (field) {
      const { _f, ...current } = field;
      set(
        output,
        name,
        _f && !_f.ref.disabled ? _f.value : Array.isArray(field) ? [] : {},
      );

      if (current) {
        getFieldsValues(
          {
            current,
          },
          output[name],
        );
      }
    }
  }

  return output;
};

export default getFieldsValues;
