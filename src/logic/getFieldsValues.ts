import * as React from 'react';
import set from '../utils/set';
import { FieldRefs, FieldValues } from '../types';
import omit from '../utils/omit';

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef: React.MutableRefObject<FieldValues> = { current: {} },
  output: Record<string, any> = {},
): any => {
  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name];

    if (field) {
      const _f = field._f;
      const current = omit(field, '_f');

      (!_f || (_f && !_f.ref.disabled)) &&
        set(output, name, _f ? _f.value : Array.isArray(field) ? [] : {});

      if (current) {
        getFieldsValues(
          {
            current,
          },
          defaultValuesRef,
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
