import React from 'react';

import { FieldValues } from '../types';

import generateId from './generateId';

export default <T>(
  values: T[],
  keyName: string,
  _fieldIds?: React.MutableRefObject<T[]>,
) =>
  values.map((value, index) => ({
    ...value,
    [keyName]:
      _fieldIds && _fieldIds.current[index]
        ? (_fieldIds.current[index] as FieldValues)[keyName]
        : value[keyName as keyof T] || generateId(),
  }));
