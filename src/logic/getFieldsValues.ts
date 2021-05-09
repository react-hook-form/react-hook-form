import * as React from 'react';

import { FieldRefs, FieldValues } from '../types';
import omit from '../utils/omit';
import set from '../utils/set';

const getFieldsValuesInternal = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef?: React.MutableRefObject<FieldValues>,
  output: FieldValues = {},
) => {
  for (const name in fieldsRef.current) {
    const field = fieldsRef.current[name];

    if (field) {
      const _f = field._f;
      const current = omit(field, '_f');

      set(
        output,
        name,
        _f
          ? _f.ref.disabled || (_f.refs && _f.refs.every((ref) => ref.disabled))
            ? undefined
            : _f.value
          : Array.isArray(field)
          ? []
          : {},
      );

      current &&
        getFieldsValuesInternal(
          {
            current,
          },
          defaultValuesRef,
          output[name],
        );
    }
  }

  return output;
};

export default (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef?: React.MutableRefObject<FieldValues>,
): any => {
  const output = getFieldsValuesInternal(fieldsRef, defaultValuesRef);

  return defaultValuesRef && defaultValuesRef.current
    ? {
        ...defaultValuesRef.current,
        ...output,
      }
    : output;
};
