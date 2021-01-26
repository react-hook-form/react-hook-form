import * as React from 'react';
import set from '../utils/set';
import { FieldRefs } from '../types';
import getFieldValue from './getFieldValue';

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  shouldReturnSubmitValue?: boolean,
  output: Record<string, any> = {},
): any => {
  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name];

    if (field) {
      const { _f, ...current } = field;
      set(
        output,
        name,
        shouldReturnSubmitValue && _f
          ? getFieldValue(field, shouldReturnSubmitValue)
          : _f
          ? _f.value
          : Array.isArray(field)
          ? []
          : {},
      );

      if (current) {
        getFieldsValues(
          {
            current,
          },
          shouldReturnSubmitValue,
          output[name],
        );
      }
    }
  }

  return output;
};

export default getFieldsValues;
