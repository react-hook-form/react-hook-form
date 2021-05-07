import * as React from 'react';

import { DefaultValuesStrategy, FieldRefs, FieldValues } from '../types';
import { deepMerge } from '../utils/deepMerge';
import omit from '../utils/omit';
import set from '../utils/set';

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef?: FieldValues,
  defaultValuesStrategy: DefaultValuesStrategy | '' = 'shallow',
  output: Record<string, any> = {},
): any => {
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

      if (current) {
        getFieldsValues(
          {
            current,
          },
          defaultValuesRef,
          defaultValuesStrategy,
          output[name],
        );
      }
    }
  }

  return defaultValuesStrategy && defaultValuesRef
    ? defaultValuesStrategy === 'shallow'
      ? {
          ...defaultValuesRef,
          ...output,
        }
      : deepMerge(defaultValuesRef, output)
    : output;
};

export default getFieldsValues;
