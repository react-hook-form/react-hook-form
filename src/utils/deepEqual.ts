import * as React from 'react';
import isObject from '../utils/isObject';
import isPrimitive from './isPrimitive';

export default function deepEqual(object1: any, object2: any) {
  if (
    isPrimitive(object1) ||
    isPrimitive(object2) ||
    object1 instanceof Date ||
    object2 instanceof Date
  ) {
    return object1 === object2;
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  if (
    !React.isValidElement(object1) &&
    !keys1.includes('ref') &&
    !keys1.includes('context')
  ) {
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];

      if (
        (isObject(val1) || Array.isArray(val1)) &&
        (isObject(val2) || Array.isArray(val2))
          ? !deepEqual(val1, val2)
          : val1 !== val2
      ) {
        return false;
      }
    }
  }

  return true;
}
