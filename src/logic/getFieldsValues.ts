import * as React from 'react';
import set from '../utils/set';
import getFieldValueAs from './getFieldValueAs';
import { FieldRefs } from '../types';

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
        _f && !_f.ref.disabled
          ? shouldReturnSubmitValue
            ? getFieldValueAs(
                _f.value,
                _f.valueAsNumber,
                _f.valueAsDate,
                _f.setValueAs,
              )
            : _f.value
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
