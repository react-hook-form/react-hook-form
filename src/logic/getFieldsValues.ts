import * as React from 'react';
import set from '../utils/set';
import getFieldValueAs from './getFieldValueAs';
import { FieldRefs, FieldValues } from '../types';

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef: React.MutableRefObject<FieldValues>,
  shouldReturnAsValue?: boolean,
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
          ? getFieldValueAs(_f.value, _f, shouldReturnAsValue)
          : Array.isArray(field)
          ? []
          : {},
      );

      if (current) {
        getFieldsValues(
          {
            current,
          },
          defaultValuesRef,
          shouldReturnAsValue,
          output[name],
        );
      }
    }
  }

  return {
    ...defaultValuesRef.current,
    ...output,
  };
};

export default getFieldsValues;
