import * as React from 'react';

import { FieldValues } from '../types';

export default <T, K>(
  values: T[],
  _fieldIds: React.MutableRefObject<K>,
  keyName: string,
) =>
  values.map((value, index) => {
    const output = _fieldIds.current[index as keyof K];

    return {
      ...value,
      ...(output ? { [keyName]: (output as FieldValues)[keyName] } : {}),
    };
  });
