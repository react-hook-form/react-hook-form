import isObject from '../utils/isObject';

import isDateObject from './isDateObject';
import isPrimitive from './isPrimitive';
/**
 * Compares two values deeply to determine
 * if they are equal. Handles primitives,
 * dates, objects, and arrays.
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { a: 1, b: { c: 2 } };
 * deepEqual(obj1, obj2)    // Output: true
 *
 * const obj3 = { a: 1, b: { c: 3 } };
 * deepEqual(obj1, obj3)    // Output: false
 *
 * const date1 = new Date(2020, 1, 1);
 * const date2 = new Date(2020, 1, 1);
 * deepEqual(date1, date2) // Output: true
 *
 * @remarks This function compares complex
 * structures including nested objects and arrays.
 */
export default function deepEqual(object1: any, object2: any) {
  if (isPrimitive(object1) || isPrimitive(object2)) {
    return object1 === object2;
  }

  if (isDateObject(object1) && isDateObject(object2)) {
    return object1.getTime() === object2.getTime();
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
