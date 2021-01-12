import * as React from 'react';
import set from '../utils/set';
import { FieldRefs } from '../types';
import isObject from '../utils/isObject';

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  output: Record<string, any> = {},
): any => {
  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name];

    if (field) {
      const { __field, ...current } = field;
      set(
        output,
        name,
        __field && !__field.ref.disabled
          ? __field.value
          : Array.isArray(field)
          ? []
          : {},
      );

      if (isObject(current)) {
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
