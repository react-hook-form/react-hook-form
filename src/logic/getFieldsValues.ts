import * as React from 'react';

import { SHALLOW } from '../constants';
import { DefaultValuesStrategy, FieldRefs, FieldValues } from '../types';
import cloneObject from '../utils/cloneObject';
import { deepMerge } from '../utils/deepMerge';
import omit from '../utils/omit';
import set from '../utils/set';

const getFieldsValuesInternal = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef?: React.MutableRefObject<FieldValues>,
  defaultValuesStrategy: DefaultValuesStrategy | boolean = SHALLOW,
  output: Record<string, any> = {},
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
          defaultValuesStrategy,
          output[name],
        );
    }
  }

  return output;
};

const getFieldsValues = (
  fieldsRef: React.MutableRefObject<FieldRefs>,
  defaultValuesRef?: React.MutableRefObject<FieldValues>,
  defaultValuesStrategy: DefaultValuesStrategy | boolean = SHALLOW,
): any => {
  const output = getFieldsValuesInternal(
    fieldsRef,
    defaultValuesRef,
    defaultValuesStrategy,
  );

  return defaultValuesStrategy && defaultValuesRef && defaultValuesRef.current
    ? defaultValuesStrategy === SHALLOW
      ? {
          ...defaultValuesRef.current,
          ...output,
        }
      : deepMerge(cloneObject(defaultValuesRef.current), output)
    : output;
};

export default getFieldsValues;
