import * as React from 'react';
import set from '../utils/set';
import { InternalFieldName } from '../types';

export const registerFieldArray = <T extends Object[]>(
  fieldsRef: React.MutableRefObject<any>,
  name: InternalFieldName,
  values: T,
  index: number = 0,
  parentName = '',
) => {
  Array.isArray(values) &&
    values.forEach((appendValueItem, valueIndex) =>
      Object.entries(appendValueItem).forEach((fieldNameAndValue) => {
        if (fieldNameAndValue) {
          const [key, value] = fieldNameAndValue;
          const inputName = `${parentName || name}.${
            parentName ? valueIndex : index + valueIndex
          }.${key}`;

          Array.isArray(value)
            ? registerFieldArray(fieldsRef, name, value, valueIndex, inputName)
            : set(fieldsRef.current, inputName, {
                _f: {
                  ref: {
                    name: inputName,
                  },
                  name: inputName,
                  value,
                },
              });
        }
      }),
    );
};
