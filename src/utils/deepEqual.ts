import * as React from 'react';
import isObject from '../utils/isObject';
import isPrimitive from './isPrimitive';

export default function deepEqual(
  object1: any,
  object2: any,
  isErrorObject?: boolean,
) {
  if (
    isPrimitive(object1) ||
    isPrimitive(object2) ||
    object1 instanceof Date ||
    object2 instanceof Date
  ) {
    return object1 === object2;
  }

  if (!React.isValidElement(object1)) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = object1[key];

      if (!(isErrorObject && key === 'ref')) {
        const val2 = object2[key];

        if (
          (isObject(val1) || Array.isArray(val1)) &&
          (isObject(val2) || Array.isArray(val2))
            ? !deepEqual(val1, val2, isErrorObject)
            : val1 !== val2
        ) {
          return false;
        }
      }
    }
  }

  return true;
}
