import isObject from '../utils/isObject';

import isDateObject from './isDateObject';
import isPrimitive from './isPrimitive';
import isTypedArray from './isTypedArray';

export default function deepEqual(object1: any, object2: any) {
  if (isPrimitive(object1) || isPrimitive(object2)) {
    return object1 === object2;
  }

  if (isDateObject(object1) && isDateObject(object2)) {
    return object1.getTime() === object2.getTime();
  }

  if (isTypedArray(object1) || isTypedArray(object2)) {
    if (!(isTypedArray(object1) && isTypedArray(object2))) {
      return false;
    }
    if (object1.length !== object2.length) {
      return false;
    }
    for (let i = 0; i < object1.length; i++) {
      if (object1[i] !== object2[i]) {
        return false;
      }
    }
    return true;
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];

    if (!keys2.includes(key)) {
      return false;
    }

    if (key !== 'ref') {
      const val2 = object2[key];

      if (
        (isDateObject(val1) && isDateObject(val2)) ||
        (isObject(val1) && isObject(val2)) ||
        (Array.isArray(val1) && Array.isArray(val2))
          ? !deepEqual(val1, val2)
          : val1 !== val2
      ) {
        return false;
      }
    }
  }

  return true;
}
