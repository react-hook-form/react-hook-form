import React from 'react';

import { FieldValues } from '../types';

import generateId from './generateId';

export default <T, K>(
  values: T[],
  keyName: string,
  _fieldIds?: React.MutableRefObject<K>,
) =>
  values.map((value, index) => ({
    ...value,
    [keyName]:
      _fieldIds && _fieldIds.current[index as keyof K]
        ? (_fieldIds.current[index as keyof K] as FieldValues)[keyName]
        : value[keyName as keyof T] || generateId(),
  }));
